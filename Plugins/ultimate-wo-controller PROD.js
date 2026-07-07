import { LitElement, html, css }
  from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class UltimateWOControllerProd extends LitElement {

  static properties = {
    workOrder: { type: String },
    value: { type: Object },
    loading: { type: Boolean },
    error: { type: String },
    filteredSegments: { type: Array },
    readOnly: { type: Boolean }   // ✅ ADD THIS
  };

  constructor() {
    super();
    this.workOrder = "";
    this.value = {};
    this.loading = false;
    this.error = "";
    this.filteredSegments = [];
    this.readOnly = false;
  }

  static getMetaConfig() {
    return {
      version: "1.0",
      controlName: "Ultimate WO Controller Prod",
      groupName: "William Adams Prod",
      properties: {
        value: {
          type: "object",
          title: "Work Order Data",
          isValueField: true,
          properties: {
            Branch: { type: "string", title: "Branch" },
            CustomerName: { type: "string", title: "Customer Name" },
            CustomerNumber: { type: "string", title: "Customer Number" },
            ModelNumber: { type: "string", title: "Model Number" },
            RepairCost: { type: "number", title: "Repair Cost" },
            RepairDescription: { type: "string", title: "Repair Description" },
            SMU: { type: "string", title: "SMU" },
            SerialNumber: { type: "string", title: "Serial Number" },
            WorkOrderNo: { type: "string", title: "Work Order No" },
            Segment: {
              type: "array",
              title: "Segments",
              items: { type: "string" }
            },
            Servicemen: {
              type: "array",
              title: "Servicemen",
              items: { type: "string" }
            },
            FilteredSegments: {
              type: "array",
              title: "Filtered Segments (from textarea)",
              items: { type: "string" }
            },
            readOnly: {
        type: 'boolean',
        title: 'Read Only',
        description: 'Hides the search button',
        defaultValue: false
      },
          }
        }
      }
    };
  }

  // firstUpdated() {
  //   this.searchWO();
  // }

  render() {
    return html`
      <div class="container">
        <button
          class="wo-button"
          @click=${this.searchWO}
          ?disabled=${this.loading || this.readOnly}
        >
          ${this.loading ? "Searching..." : "Search"}
        </button>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      </div>
    `;
  }

  // â”€â”€ Get segment-helper textarea â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _getSegmentHelperTextarea() {
    return document.querySelector('.nf-segment-helper textarea');
  }

  // â”€â”€ Parse textarea value: JSON array ["99"] or CSV "ZZ:true" â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _parseTextareaValue(rawValue) {
    if (!rawValue || !rawValue.trim()) return [];
    const trimmed = rawValue.trim();

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(v => String(v).trim()).filter(Boolean);
        }
      } catch (e) {
        console.warn('[WOController] JSON parse failed:', e);
      }
    }

    return trimmed
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const colonIdx = part.indexOf(':');
        return colonIdx > -1 ? part.substring(0, colonIdx).trim() : part;
      })
      .filter(Boolean);
  }

  _getSelectedSegmentsFromTextarea() {
    const textarea = this._getSegmentHelperTextarea();
    if (!textarea || !textarea.value) return [];
    return this._parseTextareaValue(textarea.value);
  }

  _filterSegmentsByTextarea(apiSegments) {
    const selectedKeys = this._getSelectedSegmentsFromTextarea();
    if (!selectedKeys.length) return [];
    return apiSegments.filter(seg => selectedKeys.includes(seg));
  }

  // â”€â”€ Get the plugin host element â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _getPluginHost() {
    return document.querySelector('service-expense-approval-plugin');
  }

  // â”€â”€ Use the plugin's own API to set segments and selected value â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // The plugin exposes:
  //   setSegments(array)      â€” populates the <select> options
  //   selectedSegment setter  â€” sets the chosen value
  //   __segments              â€” internal segments array
  //   __selectedSegment       â€” internal selected value
  _applySegmentsToPlugin(allSegments, selectedValues, attempt = 1) {
    console.log(`[WOController] _applySegmentsToPlugin attempt #${attempt}`);
    console.log('[WOController] allSegments =>', allSegments);
    console.log('[WOController] selectedValues =>', selectedValues);

    const host = this._getPluginHost();
    if (!host) {
      if (attempt < 10) {
        setTimeout(() => this._applySegmentsToPlugin(allSegments, selectedValues, attempt + 1), 300);
      } else {
        console.error('[WOController] Plugin host never found after 10 attempts.');
      }
      return;
    }

    // Step 1: Feed all segments into the plugin via setSegments()
    // This populates the <select> options inside the shadow DOM
    if (typeof host.setSegments === 'function') {
      console.log('[WOController] Calling host.setSegments() with:', allSegments);
      host.setSegments(allSegments);
    } else {
      // Fallback: set the property directly
      console.warn('[WOController] setSegments() not found, setting __segments directly');
      host.__segments = allSegments;
      // Trigger Lit re-render if possible
      if (typeof host.requestUpdate === 'function') host.requestUpdate();
    }

    // Step 2: After segments are set, set the selected value
    // Use a short delay to allow Lit to re-render the new options
    if (selectedValues && selectedValues.length) {
      const valueToSelect = selectedValues[0]; // single-select: use first value
      setTimeout(() => {
        this._setPluginSelectedValue(host, valueToSelect);
      }, 150);
    }
  }

  // â”€â”€ Set the selected value on the plugin after options are rendered â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _setPluginSelectedValue(host, valueToSelect, attempt = 1) {
    console.log(`[WOController] _setPluginSelectedValue attempt #${attempt} â€” value: "${valueToSelect}"`);

    // Method 1: use the plugin's own selectedSegment setter
    if ('selectedSegment' in host) {
      console.log('[WOController] Setting host.selectedSegment =', valueToSelect);
      host.selectedSegment = valueToSelect;
    }

    // Method 2: also set internal property directly as backup
    if ('__selectedSegment' in host) {
      console.log('[WOController] Setting host.__selectedSegment =', valueToSelect);
      host.__selectedSegment = valueToSelect;
      if (typeof host.requestUpdate === 'function') host.requestUpdate();
    }

    // Method 3: pierce shadow DOM and set the <select> directly
    const shadow = host.shadowRoot;
    if (shadow) {
      const select = shadow.querySelector('select.segment-select, select');
      if (select) {
        console.log('[WOController] Shadow select options.length =>', select.options.length);
        console.log('[WOController] Shadow select options =>', Array.from(select.options).map(o => `"${o.value}"/"${o.text}"`));

        if (select.options.length <= 1 && attempt < 10) {
          // Options not rendered yet â€” retry
          console.log(`[WOController] Options not ready yet, retry in 300ms (attempt ${attempt + 1})`);
          setTimeout(() => this._setPluginSelectedValue(host, valueToSelect, attempt + 1), 300);
          return;
        }

        const matchedOption = Array.from(select.options).find(opt =>
          valueToSelect.trim().toLowerCase() === opt.value.trim().toLowerCase() ||
          valueToSelect.trim().toLowerCase() === opt.text.trim().toLowerCase()
        );

        console.log('[WOController] matchedOption =>', matchedOption
          ? `value="${matchedOption.value}" text="${matchedOption.text}"`
          : 'NONE MATCHED â€” values: ' + Array.from(select.options).map(o => o.value).join(', '));

        if (matchedOption) {
          // Use native setter to bypass framework interception
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
          if (nativeSetter) {
            nativeSetter.set.call(select, matchedOption.value);
          } else {
            select.value = matchedOption.value;
          }
          select.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
          select.dispatchEvent(new Event('input',  { bubbles: true, composed: true }));
          console.log('[WOController] âœ… Shadow select set to:', select.value);
        }
      } else {
        console.warn('[WOController] No <select> inside shadow root');
      }
    }

    // Method 4: dispatch ntx-value-change from the plugin itself to notify Nintex
    try {
      host.dispatchEvent(new CustomEvent('ntx-value-change', {
        bubbles: true,
        composed: true,
        detail: valueToSelect
      }));
      console.log('[WOController] Dispatched ntx-value-change on plugin host with:', valueToSelect);
    } catch(e) {
      console.warn('[WOController] Could not dispatch ntx-value-change on plugin:', e);
    }
  }

  _getWorkOrderNumber() {
    const wrapper = document.querySelector('.nf-workorder-input');
    if (wrapper) {
      const input = wrapper.querySelector('input');
      if (input?.value) return input.value.trim();
    }
  }

  async searchWO() {
    const wo = this._getWorkOrderNumber();
    console.log('[WOController] workOrder =>', wo);
    if (!wo) return;

    this.loading = true;
    this.error = "";

    // Read textarea BEFORE fetch
    const textareaSegments = this._getSelectedSegmentsFromTextarea();
    const hasTextareaValue = textareaSegments.length > 0;
    console.log('[WOController] textareaSegments =>', textareaSegments, '| hasTextareaValue =>', hasTextareaValue);

    try {
      //const URI = "https://dummyjson.com/c/8dfa-f6fc-4c9c-988c";
      const URI = "https://dbsservice.wadams.com.au/DBSSERvice.svc/GetWorkOrderDetails/"+ wo + "/" + 'xxxxx';
      const detRes = await fetch(URI);
      const details = await detRes.json();

      //var serviceUri = "https://dummyjson.com/c/a17a-d2fd-44ae-b1fb";
      var serviceUri =  "https://dbsservice.wadams.com.au/DBSSERvice.svc/GetWorkOrderSegments/" + wo;
     
      const segRes = await fetch(serviceUri);
      const segments = await segRes.json();

      const allSegments = Array.isArray(segments) ? segments : [];
      console.log('[WOController] allSegments from API =>', allSegments);

      const filtered = this._filterSegmentsByTextarea(allSegments);
      console.log('[WOController] filtered =>', filtered);

      this.value = {
        Branch: details.Branch || "",
        CustomerName: details.CustomerName || "",
        CustomerNumber: details.CustomerNumber || "",
        ModelNumber: details.ModelNumber || "",
        RepairCost: details.RepairCost || null,
        RepairDescription: details.RepairDescription || "",
        SMU: details.SMU || "",
        SerialNumber: details.SerialNumber || "",
        WorkOrderNo: wo,
        Segment: allSegments,
        Servicemen: details.Servicemen || [],
        FilteredSegments: filtered
      };

      this.dispatchEvent(new CustomEvent('ntx-value-change', {
        bubbles: true,
        composed: true,
        detail: this.value
      }));

      // â”€â”€ Always feed segments into the plugin (it needs them to render options) â”€
      // If textarea has a value, also pre-select it; otherwise just populate options
      this._applySegmentsToPlugin(allSegments, hasTextareaValue ? textareaSegments : []);

      // â”€â”€ Inject checkboxes into .nf-segment-control â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      this.setFormSegments(allSegments);

      if (hasTextareaValue) {
        setTimeout(() => this._preCheckSegmentsByTextarea(textareaSegments), 400);
      }

    } catch (err) {
      console.error('[WOController] ERROR:', err);
      this.error = "Failed to load Work Order";
    } finally {
      this.loading = false;
    }
  }

  _preCheckSegmentsByTextarea(segmentValues) {
    if (!segmentValues || !segmentValues.length) return;
    const groupEls = document.querySelectorAll('.nf-segment-control');
    groupEls.forEach(groupEl => {
      const checkboxGroup = groupEl.querySelector('.nx-checkbox-group');
      if (!checkboxGroup) return;
      checkboxGroup.querySelectorAll('.nx-checkbox.injected input[type="checkbox"]').forEach(input => {
        const shouldCheck = segmentValues.some(
          val => val.trim().toLowerCase() === input.value.trim().toLowerCase()
        );
        if (shouldCheck && !input.checked) {
          input.checked = true;
          this._syncFauxCheckbox(input);
          const parentForm = groupEl.closest('form');
          const textarea = parentForm
            ? parentForm.querySelector('.nf-segment-helper textarea, .nf-segments-textarea textarea')
            : null;
          if (textarea) this.handle_CheckboxClick(input, textarea);
        }
      });
    });
  }

  setFormSegments(segmentsList) {
    if (!segmentsList || !segmentsList.length) return;
    const groupEls = document.querySelectorAll('.nf-segment-control');
    if (!groupEls || groupEls.length === 0) {
      console.warn('setFormSegments: .nf-segment-control not found');
      return;
    }

    groupEls.forEach((groupEl) => {
      const checkboxGroup = groupEl.querySelector('.nx-checkbox-group');
      if (!checkboxGroup) return;

      const parentForm = groupEl.closest('form');
      let textarea = null;
      if (parentForm) {
        textarea =
          parentForm.querySelector('.nf-segment-helper textarea') ||
          parentForm.querySelector('.nf-segments-textarea textarea');
      }
      if (!textarea) return;

      const originalInput = checkboxGroup.querySelector('input[type="checkbox"]');
      const inputName = originalInput ? originalInput.name : 'segments';
      const self = this;

      segmentsList.forEach(smName => {
        const safeId = smName.replace(/[^a-zA-Z0-9]/g, '_');
        const wrapper = document.createElement('div');
        wrapper.className = 'nx-checkbox injected';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = inputName;
        input.value = smName;
        input.id = 'sm_' + safeId + '_' + Math.random().toString(36).slice(2, 6);
        input.checked = false;
        input.setAttribute('data-e2e', 'get-sm-' + safeId);

        input.addEventListener('change', function () {
          self._syncFauxCheckbox(this);
          self.handle_CheckboxClick(this, textarea);
          const updatedFiltered = self._filterSegmentsByTextarea(segmentsList);
          self.filteredSegments = [...updatedFiltered];
          self.value = { ...self.value, FilteredSegments: updatedFiltered };
          self.dispatchEvent(new CustomEvent('ntx-value-change', {
            bubbles: true,
            composed: true,
            detail: self.value
          }));
        });

        const container = document.createElement('div');
        container.className = 'nx-checkbox-container';
        const faux = document.createElement('span');
        faux.className = 'nx-checkbox-faux';
        const labelText = document.createElement('span');
        labelText.className = 'nx-checkbox-label';
        labelText.textContent = smName;
        container.appendChild(faux);
        container.appendChild(labelText);
        label.appendChild(input);
        label.appendChild(container);
        wrapper.appendChild(label);
        checkboxGroup.appendChild(wrapper);
      });
    });
  }

  _syncFauxCheckbox(inputEl) {
    const label = inputEl.closest('label') || inputEl.parentElement;
    const faux = label ? label.querySelector('.nx-checkbox-faux') : null;
    this._applyFauxCheckedStyle(faux, inputEl.checked);
  }

  _applyFauxCheckedStyle(fauxEl, isChecked) {
    if (!fauxEl) return;
    if (isChecked) {
      fauxEl.style.backgroundColor = '#0070d2';
      fauxEl.style.borderColor = '#0070d2';
      fauxEl.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23fff' stroke-width='2' d='M2 8l4 4 8-8'/%3E%3C/svg%3E\")";
      fauxEl.style.backgroundRepeat = 'no-repeat';
      fauxEl.style.backgroundPosition = 'center';
      fauxEl.style.backgroundSize = '70%';
    } else {
      fauxEl.style.backgroundColor = '';
      fauxEl.style.borderColor = '';
      fauxEl.style.backgroundImage = '';
    }
  }

  handle_CheckboxClick(cb, textarea) {
    if (!textarea) return;
    let value = textarea.value || '';
    let parts = value ? value.split(',').filter(Boolean) : [];
    let found = false;
    parts = parts.map(part => {
      const colonIdx = part.indexOf(':');
      const name = colonIdx > -1 ? part.substring(0, colonIdx).trim() : part.trim();
      if (name === cb.value.trim()) {
        found = true;
        return cb.checked ? `${cb.value}:true` : null;
      }
      return part;
    }).filter(Boolean);
    if (!found && cb.checked) parts.push(`${cb.value}:true`);

    const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    if (nativeValueSetter) {
      nativeValueSetter.set.call(textarea, parts.join(','));
    } else {
      textarea.value = parts.join(',');
    }
  }

  static styles = css`
    .container { width: 100%; font-family: Arial, sans-serif; }
    .wo-button {
      padding: 8px 20px; font-size: 14px; font-weight: 500;
      border: none; border-radius: 4px; background: #006BD6;
      color: white; cursor: pointer; transition: all 0.15s ease;
    }
    .wo-button:hover { background: #1A7FE0; }
    .wo-button:active { background: #4DA3F5; transform: translateY(1px); }
    .wo-button:disabled { background: #9bbfe8; cursor: not-allowed; }
    .error { color: red; margin-top: 8px; }
  `;
}

customElements.define('ultimate-wo-controllerprod', UltimateWOControllerProd);
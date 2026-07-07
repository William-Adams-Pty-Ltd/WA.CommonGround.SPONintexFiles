import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

const FORM_IDS = {
  reworkWorkOrderInput: '_e7fddd1a072a4f5baa7e102c2152e335-input',
  searchButton: '_4a1e7267c83444a29574ef4f531b6718-btn',
  segmentSelect: '_362dc540efb24c1b91eafc0f0a914c2c-select',
  servicemenGroup: '_17ad37eb601646c2baff704b4f8c5467'
};

function addpleasewait() {
  let overlay = document.getElementById('spap-please-wait-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'spap-please-wait-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.4)', display: 'none',
      zIndex: '99999', alignItems: 'center',
      justifyContent: 'center', fontSize: '18px',
      color: '#fff', textAlign: 'center'
    });
    overlay.textContent = 'Please wait...';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function removepleasewait() {
  const o = document.getElementById('spap-please-wait-overlay');
  if (o) setTimeout(() => { o.style.display = 'none'; }, 2000);
}

function _getServicemenTextarea() {
  return document.querySelector('div[data-controlname="Servicemen"] textarea')
    || document.querySelector('div[data-controlname="servicemen"] textarea')
    || document.querySelector('.nf-servicemen-textarea')
    || null;
}

function handle_CheckboxClick(cb) {
  const textarea = _getServicemenTextarea();
  if (!textarea) { console.warn('handle_CheckboxClick: servicemen textarea not found'); return; }

  let value = textarea.value || '';
  const parts = value.split(',');
  let found = false;

  const updated = parts.map(part => {
    const [name] = part.split(':');
    if (name && name.trim() === cb.value.trim()) {
      found = true;
      return `${cb.value}:${cb.checked}`;
    }
    return part;
  });

  if (!found && cb.checked) {
    updated.push(`${cb.value}:true`);
  }

  textarea.value = updated.filter(Boolean).join(',');
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function handle_SegmentsCheckboxClick(cb, sectionAndControlName) {
  const picker = NWF$(`div[data-controlname="${sectionAndControlName}"] textarea`);
  let value = NWF$(picker).val();
  NWF$.each(value.split(','), function (_, ele) {
    if (ele.split(':')[0].indexOf(cb.value) !== -1)
      value = value.replace(ele, `${cb.value}:${cb.checked}`);
  });
  NWF$(picker).val(value);
}

function DrawSegments(sectionAndControlName) {
  NWF$(`#${sectionAndControlName}cb`).html('');
  NWF$(`.nf-${sectionAndControlName}ChoiceControl`).parent().html('');

  const isDisplayMode = NWF$(location).attr('href').indexOf('mode=2') > -1;
  const existingVal = isDisplayMode
    ? NWF$(`div[data-controlname="${sectionAndControlName}"] input`).val()
    : NWF$(`div[data-controlname="${sectionAndControlName}"] textarea`).val();

  if (!existingVal || !existingVal.length) return;

  const checkbox_div = NWF$('<div>', { id: `${sectionAndControlName}cb` });
  let smCount = 0;

  NWF$.each(existingVal.split(','), function (_, val) {
    const [name, checked] = val.split(':');
    const inputcb = NWF$('<input>', {
      type: 'checkbox', name: 'smcb',
      onclick: `handle_SegmentsCheckboxClick(this,"${sectionAndControlName}")`,
      value: name, text: name,
      ...(checked === 'true' ? { checked: true } : {})
    });
    if (isDisplayMode) NWF$(inputcb).prop('disabled', true);
    checkbox_div.append(inputcb).append(name).append(NWF$('<br>'));
    smCount++;
  });

  if (smCount > 0) {
    let target = NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`);
    while (target.html().length) target = target.children();
    target.append(checkbox_div);
    NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`).show();
  }
}

function _applyFauxCheckedStyle(fauxEl, isChecked) {
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

function _syncFauxCheckbox(inputEl) {
  const label = inputEl.closest('label') || inputEl.parentElement;
  const faux = label ? label.querySelector('.nx-checkbox-faux') : null;
  _applyFauxCheckedStyle(faux, inputEl.checked);
}

function setFormServicemen(servicemenList) {
  const groupEl = document.querySelector('.nf-service-control');
  if (!groupEl) { console.warn('setFormServicemen: .nf-service-control not found'); return; }

  const checkboxGroup = groupEl.querySelector('.nx-checkbox-group');
  if (!checkboxGroup) { console.warn('setFormServicemen: .nx-checkbox-group not found'); return; }

  checkboxGroup.querySelectorAll('.nx-checkbox.ng-star-inserted').forEach(el => el.remove());

  if (!servicemenList || !servicemenList.length) return;

  const textarea = _getServicemenTextarea();
  const existingValue = textarea ? (textarea.value || '') : '';
  const selectedMap = {};
  existingValue.split(',').forEach(item => {
    const [name, state] = item.trim().split(':');
    if (name) selectedMap[name.trim()] = state === 'true';
  });

  const originalInput = checkboxGroup.querySelector('input[type="checkbox"]');
  const inputName = originalInput ? originalInput.name : 'servicemen';

  servicemenList.forEach(smName => {
    const safeId = smName.replace(/[^a-zA-Z0-9]/g, '_');

    const wrapper = document.createElement('div');
    wrapper.className = 'nx-checkbox injected';

    const label = document.createElement('label');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = inputName;
    input.value = smName;
    input.id = 'sm_' + safeId;
    input.checked = selectedMap[smName] === true;
    input.setAttribute('data-e2e', 'get-sm-' + safeId);

    input.addEventListener('change', function () {
      _syncFauxCheckbox(this);
      handle_CheckboxClick(this);
    });

    const container = document.createElement('div');
    container.className = 'nx-checkbox-container';

    const faux = document.createElement('span');
    faux.className = 'nx-checkbox-faux';
    if (input.checked) _applyFauxCheckedStyle(faux, true);

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

  console.log('setFormServicemen: injected', servicemenList.length, 'servicemen');
}

function searchworkorder() {
  const reworkInput = document.querySelector('[data-e2e="' + FORM_IDS.reworkWorkOrderInput + '"]');
  const workOrderNo = ((reworkInput ? reworkInput.value : '') || '').toUpperCase().replace(/ /g, '');
  getWorkOrderSegments(workOrderNo);
}

function getWorkOrderSegments(workOrderNo) {
  try {
    addpleasewait();
    //var serviceUri = "https://dummyjson.com/c/a17a-d2fd-44ae-b1fb";
    var serviceUri = "https://dbsservice.wadams.com.au/DBSSERvice.svc/GetWorkOrderSegments/"+ workOrderNo;
    fetch(serviceUri, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (result) {
        if (window.serviceExpensePlugin) {
          window.serviceExpensePlugin.setSegments(result);
        } else {
          console.error('Plugin not ready');
        }
      })
      .catch(function (err) {
        console.error('getWorkOrderSegments failed:', err);
      })
      .finally(function () {
        removepleasewait();
      });
  } catch (ex) {
    console.error(ex.message);
    removepleasewait();
  }
  return false;
}

function getWorkOrderDetails(workOrderNo, segmentValue) {
  //const URI = "https://dummyjson.com/c/9b6d-fbf9-4f86-a0de";
  const URI = "https://dbsservice.wadams.com.au/DBSSERvice.svc/GetWorkOrderDetails/"+ workOrderNo + "/" + segmentValue;
  addpleasewait();
  fetch(URI, {
    method: 'GET', headers: { 'Content-Type': 'application/json' }
  })
    .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(result => {
      const servicemenList = (result.Servicemen || []).map(s => `${s.EmpID} - ${s.Initial} ${s.Surname}`);
      if (window.serviceExpensePlugin) window.serviceExpensePlugin._renderServicemen(servicemenList);
      showWorkOrder(result);
    })
    .catch(err => console.error('getWorkOrderDetails failed:', err))
    .finally(() => removepleasewait());
}

function showWorkOrder(result) {
  if (!window.serviceExpensePlugin) return;
  const plugin = window.serviceExpensePlugin;
  const servicemenListv1 = (result.Servicemen || []).map(s => `${s.EmpID} - ${s.Initial} ${s.Surname}`);

  plugin.jsonOut = {
    Segments: plugin.jsonOut ? (plugin.jsonOut.Segments || '') : '',
    Servicemen: servicemenListv1.join(', '),
    Branch: result.Branch || '',
    CustomerName: result.CustomerName || '',
    CustomerNumber: result.CustomerNumber || '',
    ModelNumber: result.ModelNumber || '',
    SerialNumber: result.SerialNumber || '',
    SMU: result.SMU || '',
    WorkOrderNo: result.WorkOrderNo || result.WorkOrder || '',
    RepairCost: result.RepairCost || '',
    RepairDescription: result.RepairDescription || ''
  };

  plugin.dispatchEvent(new CustomEvent('ntx-value-change', {
    bubbles: true, cancelable: false, composed: true,
    detail: plugin.jsonOut
  }));

  try {
    if (result.Branch) {
      const branchWrapper = document.querySelector('div[data-controlname="OriginalBranch"]')
        || document.querySelector('div[data-controlname="ReworkBranch"]');
      if (branchWrapper) {
        const branchEl = branchWrapper.querySelector('[data-e2e]');
        if (branchEl) setNtxListLookup(branchEl.getAttribute('data-e2e'), result.Branch);
      }
    }
  } catch (e) { console.warn('showWorkOrder: branch lookup failed', e); }
}

function setNtxListLookup(controlId, searchText, retries) {
  if (!searchText) return;
  retries = retries === undefined ? 8 : retries;

  const wrapper = document.querySelector('[data-e2e="' + controlId + '"]');
  if (!wrapper) { console.warn('setNtxListLookup: not found', controlId); return; }

  const ngSelect = wrapper.querySelector('ng-select');
  const searchInput = ngSelect && ngSelect.querySelector('input[type="text"]');
  if (!searchInput) { console.warn('setNtxListLookup: input not found', controlId); return; }

  searchInput.focus();
  searchInput.value = searchText;
  ['input', 'keydown', 'keyup'].forEach(ev =>
    searchInput.dispatchEvent(new Event(ev, { bubbles: true }))
  );

  let attempts = 0;
  const poll = setInterval(() => {
    attempts++;
    const options = wrapper.querySelectorAll('.ng-option');
    if (options.length > 0) {
      clearInterval(poll);
      const match = Array.from(options).find(o =>
        (o.textContent || '').trim().toLowerCase() === searchText.toLowerCase()
      ) || options[0];
      match.click();
      return;
    }
    if (attempts >= retries) {
      clearInterval(poll);
      console.warn('setNtxListLookup: gave up for', searchText, controlId);
    }
  }, 300);
}

function ExecuteCode() {
  NWF$('.nf-saveCont-button input').click(() => {
    const reworksegdp = NWF$('div[data-controlname="reworksegdp"] select')[0];
    NWF$(reworksegdp).prop('disabled', 'disabled');
  });

  const displayName = NWF$('div[data-controlname="UserProfileName"] label')[0].innerText;
  const branch = NWF$('div[data-controlname="UserProfileBranch"] label')[0].innerText;
  const department = NWF$('div[data-controlname="UserProfileDepartment"] label')[0].innerText;
  const managerAccount = NWF$('div[data-controlname="UserProfileManager"] label')[0].innerText;

  ['UserProfileName', 'UserProfileBranch', 'UserProfileDepartment', 'UserProfileManager'].forEach(n =>
    NWF$(`div[data-controlname="${n}"] label`)[0].style.visibility = 'hidden'
  );

  const managerEmail = managerAccount.replace('i:0#.f|membership|', '');
  const dispnameFld = NWF$('.dispname-control input:visible')[0];
  if (!NWF$(dispnameFld).val()) NWF$(dispnameFld).val(displayName);

  try {
    const branchDD = NWF$('.branch-control select')[0];
    if (NWF$(branchDD).val() === '') {
      NWF$(branchDD).find('option').each((_, el) => {
        if (NWF$(el).text().indexOf(branch) > -1) {
          NWF$(branchDD).val(NWF$(el).val());
          NWF$(branchDD).parent().find('input').val(NWF$(el).attr('data-nfchoicevalue'));
          NWF$(branchDD).trigger('change');
        }
      });
    }
  } catch (_) { }

  try {
    const deptDD = NWF$('.department-control select')[0];
    if (NWF$(deptDD).val() === '') {
      NWF$(deptDD).find('option').each((_, el) => {
        if (NWF$(el).text().indexOf(department) > -1) {
          NWF$(deptDD).val(NWF$(el).val());
          NWF$(deptDD).parent().find('input').val(NWF$(el).attr('data-nfchoicevalue'));
          NWF$(deptDD).trigger('change');
        }
      });
    }
  } catch (_) { }

  try {
    if (NWF$('.manager-control .ip-item > span > div').length === 0 && managerEmail.indexOf('@') > -1) {
      const picker = new NF.PeoplePickerWrapper('.manager-control input');
      picker.add({ value: managerEmail, label: managerEmail, type: 'user', email: managerEmail });
    }
  } catch (_) { }

  if ((NWF$('div[data-controlname="ReworkSegment"] input').val() || '').toString().length > 0)
    NWF$('div[data-controlname="reworksegdp"]').hide();

  DrawSegments('StockDestroyedSegments');
  DrawSegments('SCSegments');
  DrawSegments('NQVSegments');
  DrawSegments('EGSegments');
}

export class ServiceExpenseApprovalPluginProd extends LitElement {

  static properties = {
    workOrder: { type: String },
    jsonOut: { type: Object },
    segments: { type: Array },
    selectedSegment: { type: String },
    readOnly: { type: Boolean }
  };

  constructor() {
    super();
    this.workOrder = '';
    this.jsonOut = null;
    this.segments = [];
    this.selectedSegment = '';
    this.readOnly = false;
  }

  static getMetaConfig() {
    return {
      controlName: 'Service Expense Search Plugin Prod',
      version: '1.0',
      description: 'Work order search with segment and servicemen support',
      groupName: 'William Adams Prod',
      fallbackDisableSubmit: true,
      standardProperties: {
        description: true, defaultValue: true, fieldLabel: true,
        readOnly: true, required: true, visibility: true
      },
      properties: {
        workOrder: {
          type: 'string',
          title: 'Work Order',
          description: 'Enter the work order number'
        },
        jsonOut: {
          type: 'object',
          title: 'Service Expense Search Data',
          isValueField: true,
          properties: {
            Segments: { type: 'string', title: 'Segments' },
            Servicemen: { type: 'string', title: 'Servicemen' },
            Branch: { type: 'string', title: 'Branch' },
            CustomerName: { type: 'string', title: 'CustomerName' },
            CustomerNumber: { type: 'string', title: 'CustomerNumber' },
            ModelNumber: { type: 'string', title: 'ModelNumber' },
            RepairCost: { type: 'string', title: 'RepairCost' },
            RepairDescription: { type: 'string', title: 'RepairDescription' },
            SerialNumber: { type: 'string', title: 'SerialNumber' },
            SMU: { type: 'string', title: 'SMU' },
            WorkOrderNo: { type: 'string', title: 'WorkOrderNo' }
          }
        },
        readOnly: {
          type: 'boolean',
          title: 'Read Only',
          description: 'Disables the segment dropdown',
          defaultValue: false
        },
      },
      events: ['ntx-value-change']
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.serviceExpensePlugin = this;
    setTimeout(() => {
      this._wireFormControls();
      this._restoreFromTextarea();
    }, 800);
  }

  _restoreFromTextarea() {
    const valueToSelect = this._getTextareaSegmentValue();
    if (!valueToSelect) return;

    this.segments = this.segments.length > 0 ? this.segments : [valueToSelect];
    this.selectedSegment = valueToSelect;
    this.requestUpdate();
    console.log(valueToSelect, 'valueToSelect');

    if ([valueToSelect].length == 1) {
      this.updateComplete.then(() => {
        const select = this.shadowRoot && this.shadowRoot.querySelector('select.segment-select');
        if (select) {
          select.value = valueToSelect;
        }

        if (this.jsonOut) {
          this.jsonOut = { ...this.jsonOut, Segments: valueToSelect };
        }

        setNtxListLookup(FORM_IDS.segmentSelect, valueToSelect);

        if (this.workOrder) {
          getWorkOrderDetails(this.workOrder, valueToSelect);
        }

        console.log('[Plugin] _restoreFromTextarea: ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ segment restored silently =>', valueToSelect);
      });
      return;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (window.serviceExpensePlugin === this) delete window.serviceExpensePlugin;
  }

  _wireFormControls() {
    const searchBtn = document.querySelector('[data-e2e="' + FORM_IDS.searchButton + '"]');
    if (searchBtn && !searchBtn._pluginWired) {
      searchBtn._pluginWired = true;
      searchBtn.addEventListener('click', () => {
        const input = document.querySelector('[data-e2e="' + FORM_IDS.reworkWorkOrderInput + '"]');
        this.workOrder = (input?.value || '').toUpperCase().replace(/ /g, '');
        console.log('Plugin: workOrder =', this.workOrder);
        searchworkorder();
      });
    } else if (!searchBtn) {
      console.warn('_wireFormControls: search button not found', FORM_IDS.searchButton);
    }
  }

  _renderServicemen(list) {
    setFormServicemen(Array.isArray(list) ? list : []);
  }




  _getTextareaSegmentValue() {
    const textarea = document.querySelector('.nf-segment-helper textarea');
    if (!textarea || !textarea.value || !textarea.value.trim()) return null;

    const raw = textarea.value.trim();
    console.log('[Plugin] _getTextareaSegmentValue raw =>', raw);

    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 1) {
          return String(parsed[0]).trim();
        }
        return null;
      } catch (e) {
        return null;
      }
    }

    const first = raw.split(',')[0].trim();
    const colonIdx = first.indexOf(':');
    return colonIdx > -1 ? first.substring(0, colonIdx).trim() : first;
  }
  _preselectFromTextarea() {
    const valueToSelect = this._getTextareaSegmentValue();
    if (!valueToSelect) {
      console.log('[Plugin] _preselectFromTextarea: textarea empty, nothing to pre-select');
      return;
    }

    console.log('[Plugin] _preselectFromTextarea: attempting to select =>', valueToSelect);

    this.updateComplete.then(() => {
      const select = this.shadowRoot && this.shadowRoot.querySelector('select.segment-select');
      if (!select) {
        console.warn('[Plugin] _preselectFromTextarea: shadow <select> not found');
        return;
      }

      const match = Array.from(select.options).find(
        o => o.value.trim().toLowerCase() === valueToSelect.toLowerCase()
          || o.text.trim().toLowerCase() === valueToSelect.toLowerCase()
      );

      if (!match) {
        console.warn('[Plugin] _preselectFromTextarea: no matching option for', valueToSelect,
          '| available:', Array.from(select.options).map(o => o.value));
        return;
      }

      console.log('[Plugin] _preselectFromTextarea: matched =>', match.value, match.text);

      this.selectedSegment = match.value;

      this.updateComplete.then(() => {
        select.value = match.value;
        this._handleSegmentChange({ target: select });
        console.log('[Plugin] _preselectFromTextarea: ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ pre-selection complete =>', this.selectedSegment);
      });
    });
  }

  setSegments(data) {
    this.segments = Array.isArray(data) ? data : [];
    this.selectedSegment = '';
    this.requestUpdate();
    this.jsonOut = {
      Segments: this.segments.join(','),
      Servicemen: '',
      Branch: '',
      CustomerName: '',
      CustomerNumber: '',
      ModelNumber: '',
      RepairCost: '',
      RepairDescription: '',
      SerialNumber: '',
      SMU: '',
      WorkOrderNo: ''
    };

    this.dispatchEvent(new CustomEvent('ntx-value-change', {
      bubbles: true, cancelable: false, composed: true,
      detail: this.jsonOut
    }));

    console.log('setSegments: emitted jsonOut.Segments =', this.jsonOut.Segments);

    this._preselectFromTextarea();
  }

  _handleSegmentChange(e) {
    const selectedValue = e.target.value;
    if (!selectedValue) return;
    this.selectedSegment = selectedValue;

    this.jsonOut = {
      Segments: selectedValue,
      Servicemen: '',
      Branch: '',
      CustomerName: '',
      CustomerNumber: '',
      ModelNumber: '',
      RepairCost: '',
      RepairDescription: '',
      SerialNumber: '',
      SMU: '',
      WorkOrderNo: ''
    };

    this.dispatchEvent(new CustomEvent('ntx-value-change', {
      bubbles: true, cancelable: false, composed: true,
      detail: this.jsonOut
    }));
    setNtxListLookup(FORM_IDS.segmentSelect, selectedValue);
    console.log('_handleSegmentChange: synced to form select', selectedValue);

    if (!this.workOrder) {
      console.warn('Segment selected but workOrder is empty');
      return;
    }

    console.log('Calling getWorkOrderDetails:', this.workOrder, selectedValue);
    if (typeof getWorkOrderDetails === 'function') {
      getWorkOrderDetails(this.workOrder, selectedValue);
    }
  }

  static styles = css`
    :host { display: block; margin: 16px 0; }
    :host select.segment-select {
      appearance: none !important;
    }
    .segment-wrapper { display: flex; flex-direction: column; gap: 4px; width: 100%; }
    .segment-label { font-size: 14px; color: #111; }
    .segment-label .required { color: #d03838; margin-left: 3px; }f
    .segment-select:hover { border-color: #999; }
    .segment-select:focus { outline: none; border-color: #0078d4; box-shadow: 0 0 0 2px rgba(0,120,212,0.2); }
    .segment-select {
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;

        width: 100%;
        padding: 8px;
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid #c0c4c8;
        border-radius: 5px;
        background-color: #fff;
        color: #111;
        cursor: pointer;
        font-family: inherit;
        box-sizing: border-box;

        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 22px;

        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23555' d='M18.43 21.82a.6.6 0 0 1-.86 0l-2.5-2.62-1.89-2a.7.7 0 0 1 .43-1.2h8.78a.7.7 0 0 1 .43 1.16l-1.89 2z'/%3E%3C/svg%3E");
      }
  `;

  render() {
    return html`
    <div class="segment-wrapper">
      <label class="segment-label" for="segmentSelect">
        Segment
      </label>
      <select
        id="segmentSelect"
        name="segmentSelect"
        class="segment-select"
        .value=${this.selectedSegment}
        @change=${this._handleSegmentChange}
        ?disabled=${this.readOnly}
      >
        <option value="">Please Select</option>
        ${this.segments.map(seg => html`
          <option value=${seg}>${seg}</option>
        `)}
      </select>
    </div>
  `;
  }


}

customElements.define('service-expense-approval-pluginprod', ServiceExpenseApprovalPluginProd);
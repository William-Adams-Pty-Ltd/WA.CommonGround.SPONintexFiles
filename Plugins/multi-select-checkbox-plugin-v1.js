import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class MultiSelectSegmentPluginV1 extends LitElement {

  static getMetaConfig() {
    return {
      controlName: 'Dynamic MultiSelect Checkbox control V1',
      fallbackDisableSubmit: false,
      version: '1.0',
      properties: {
        value: {
          type: 'string',
          title: 'Selected Values',
          isValueField: true   // important
        },
        optionsJson: {
          type: 'string',
          title: 'Options JSON'
        },
        apiUrl: {
          type: 'string',
          title: 'API URL'
        },
        readOnly: {
          type: 'boolean',
          title: 'Read Only',
          description: 'Hides the search button',
          defaultValue: false
        }
      }
    };
  }


  static properties = {
    value: { type: String },        // "ZZ,01"
    optionsJson: { type: String },  // JSON string
    apiUrl: { type: String },
    readOnly: { type: Boolean },
    _options: { state: true },
    _selected: { state: true }
  };

  constructor() {
    super();
    this.value = '';
    this.optionsJson = '';
    this.apiUrl = '';
    this.readOnly = false;
    this._options = [];
    this._selected = [];
  }


  connectedCallback() {
    super.connectedCallback();
    this._init();
  }

  updated(changedProps) {
    if (changedProps.has('value')) {
      this._setSelectedFromValue();
    }
  }

  async _init() {
    await this._loadOptions();


    if (this.value && this._options.length === 0) {
      this._parseValue();
    }
  }


  async _loadOptions() {
    try {
      if (this.apiUrl) {
        const res = await fetch(this.apiUrl);
        const data = await res.json();
        this._options = data.map(item => ({
          value: item.value || item.id,
          label: item.label || item.name
        }));

      } else if (this.optionsJson) {
        const raw = this.optionsJson.trim();
        const options = [];
        const selected = [];

        // CASE A: JSON array format → ["ZZ:true","01:false"] or ["ZZ","01"]
        if (raw.startsWith('[')) {
          let arr = [];
          try {
            arr = JSON.parse(raw);
          } catch (e) {
            console.warn('Invalid optionsJson JSON format', e);
            return;
          }

          arr.forEach(item => {
            if (item.includes(':')) {
              const [key, val] = item.split(':');
              const cleanKey = key?.trim();
              if (!cleanKey) return;
              options.push({ value: cleanKey, label: cleanKey });
              if (val?.trim() === 'true') selected.push(cleanKey);
            } else {
              const cleanKey = item.trim();
              if (!cleanKey) return;
              options.push({ value: cleanKey, label: cleanKey });
            }
          });

          if (arr.some(i => i.includes(':'))) {
            this._isInternalUpdate = true;
            this.value = JSON.stringify(arr);
            this._isInternalUpdate = false;
          }
        }

        // CASE B: Plain comma-separated format → 01:true,02:true,04:false
        else {
          const parts = raw.split(',');
          parts.forEach(item => {
            const trimmed = item.trim();
            if (!trimmed) return;

            if (trimmed.includes(':')) {
              const colonIdx = trimmed.indexOf(':');
              const key = trimmed.substring(0, colonIdx).trim();
              const val = trimmed.substring(colonIdx + 1).trim();
              if (!key) return;
              options.push({ value: key, label: key });
              if (val === 'true') selected.push(key);
            } else {
              options.push({ value: trimmed, label: trimmed });
            }
          });

          // Normalize to JSON array format for value field
          const normalized = options.map(opt => `${opt.value}:${selected.includes(opt.value)}`);
          this._isInternalUpdate = true;
          this.value = JSON.stringify(normalized);
          this._isInternalUpdate = false;
        }

        this._options = options;
        this._selected = selected;
      }

    } catch (e) {
      console.error('Options load error:', e);
    }
  }


  _setSelectedFromValue() {
    if (!this.value) {
      this._selected = [];
      return;
    }

    let arr = [];

    try {
      if (this.value.startsWith('[')) {
        arr = JSON.parse(this.value);
      } else {
        arr = this.value.split(',');
      }
    } catch (e) {
      console.warn('Invalid value format', e);
      this._selected = [];
      return;
    }

    const selected = [];
    const optionsFromValue = [];

    arr.forEach(item => {
      const trimmed = item.trim();
      const colonIdx = trimmed.indexOf(':');

      if (colonIdx !== -1) {
        const key = trimmed.substring(0, colonIdx).trim();
        const val = trimmed.substring(colonIdx + 1).trim();

        if (!key) return;

        // Rebuild _options from value if not yet populated
        if (this._options.length === 0) {
          optionsFromValue.push({ value: key, label: key });
        }

        if (val === 'true') {
          selected.push(key);
        }
      } else {
        // Plain key (no bool suffix)
        const key = trimmed;
        if (!key) return;

        if (this._options.length === 0) {
          optionsFromValue.push({ value: key, label: key });
        }

        selected.push(key);
      }
    });

    // Only assign reconstructed options if _options is empty
    if (this._options.length === 0 && optionsFromValue.length > 0) {
      this._options = optionsFromValue;
    }

    this._selected = selected;
  }

  _updateValue() {
    const arr = this._options.map(opt => {
      const isChecked = this._selected.includes(opt.value);
      return `${opt.value}:${isChecked}`;
    });

    const newValue = JSON.stringify(arr);

    this.value = newValue;

    this.dispatchEvent(new CustomEvent('ntx-value-change', {
      bubbles: true,
      composed: true,
      detail: newValue
    }));
  }

  _onChange(e, val) {
    let updated = [...this._selected];

    if (e.target.checked) {
      if (!updated.includes(val)) updated.push(val);
    } else {
      updated = updated.filter(v => v !== val);
    }

    this._selected = updated;
    this._updateValue();
  }


  static styles = css`
    .wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
    }
    label {
      cursor: pointer;
    }
  `;


  render() {
    return html`
      <div class="wrapper">
        ${this._options.map(opt => html`
          <label>
            <input
              type="checkbox"
              .checked=${this._selected.includes(opt.value)}
              @change=${(e) => this._onChange(e, opt.value)}
              ?disabled=${this.readOnly}
            />
            ${opt.label}
          </label>
        `)}
      </div>
    `;
  }
}


customElements.define('multi-select-checkbox-plugin-v1', MultiSelectSegmentPluginV1);
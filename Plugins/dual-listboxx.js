import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class DualListboxControl extends LitElement {
  static properties = {
    leftOptions: { type: String },   // input string
    rightOut:    { type: String },   // output string
    leftTitle:   { type: String },   // customizable left header text
    rightTitle:  { type: String },   // customizable right header text
    headerColor: { type: String }    // customizable header color
  };

  constructor() {
    super();
    this.leftOptions = '';
    this.rightOut = '';
    this.leftTitle = 'Available';
    this.rightTitle = 'Selected';
    this.headerColor = '#f0f0f0';

    this._left = [];
    this._right = [];
  }

  static getMetaConfig() {
    return {
      controlName: 'Dual Listbox v2',
      version: '1.1.0',
      description: 'Dual listbox control with customizable titles and header color.',
      groupName: 'Web Integrations',
      fallbackDisableSubmit: false,
      standardProperties: {
        description: true,
        defaultValue: true,
        fieldLabel: true,
        readOnly: true,
        required: false,
        visibility: true
      },
      properties: {
        leftOptions: {
          type: 'string',
          title: 'Left List Options',
          description: 'Comma-separated values for the left list.'
        },
        rightOut: {
          type: 'string',
          title: 'Selected Output',
          isValueField: true
        },
        leftTitle: {
          type: 'string',
          title: 'Left List Title',
          description: 'Custom header text for the left list.'
        },
        rightTitle: {
          type: 'string',
          title: 'Right List Title',
          description: 'Custom header text for the right list.'
        },
        headerColor: {
          type: 'string',
          title: 'Header Background Color',
          description: 'Hex color code for list headers (e.g., #eb4034).'
        }
      },
      events: ['ntx-value-change']
    };
  }

  updated(changed) {
    if (changed.has('leftOptions')) {
      const parsed = (this.leftOptions || '')
        .split(',')
        .map(v => v.trim())
        .filter(v => v);
      this._left = [...parsed];
      this._right = [];
      this._emitValue();
    }
  }

  static styles = css`
    :host { display: block; font-family: Arial, sans-serif; }
    .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .panel { border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .header { color: #fff; font-weight: bold; text-align: center; padding: 6px; }
    .listbox { display: flex; flex-direction: column; }
    .controls { display: flex; justify-content: center; gap: 6px; padding: 6px; }
    select { width: 100%; height: 220px; border: none; outline: none; }
    button { padding: 6px 10px; cursor: pointer; border: 1px solid #333; border-radius: 4px; }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
  `;

  get _leftSelect()  { return this.renderRoot?.getElementById('left'); }
  get _rightSelect() { return this.renderRoot?.getElementById('right'); }

  _moveSelected(from, to) {
    const sel = (from === 'L' ? this._leftSelect : this._rightSelect);
    const sourceArr = (from === 'L' ? this._left : this._right);
    const targetArr = (to   === 'R' ? this._right : this._left);

    const selected = Array.from(sel?.selectedOptions ?? []).map(o => o.value);
    this._left  = (from === 'L') ? sourceArr.filter(v => !selected.includes(v)) : this._left;
    this._right = (from === 'R') ? sourceArr.filter(v => !selected.includes(v)) : this._right;
    targetArr.push(...selected);

    this.requestUpdate();
    this._emitValue();
  }

  _moveAll(from, to) {
    const sourceArr = (from === 'L' ? this._left : this._right);
    const targetArr = (to   === 'R' ? this._right : this._left);
    if (sourceArr.length === 0) return;

    targetArr.push(...sourceArr);
    if (from === 'L') this._left = [];
    else this._right = [];

    this.requestUpdate();
    this._emitValue();
  }

  _emitValue() {
    this.rightOut = this._right.join(',');
    this.dispatchEvent(new CustomEvent('ntx-value-change', {
      bubbles: true,
      composed: true,
      detail: this.rightOut
    }));
  }

  render() {
    return html`
      <div class="wrap">
        <!-- Left list -->
        <div class="panel">
          <div class="header" style="background:${this.headerColor}">${this.leftTitle}</div>
          <div class="controls">
            <button ?disabled=${!(this._leftSelect?.selectedOptions.length > 0)}
                    @click=${() => this._moveSelected('L','R')}>➡</button>
            <button ?disabled=${this._left.length === 0}
                    @click=${() => this._moveAll('L','R')}>⏩</button>
          </div>
          <div class="listbox">
            <select id="left" multiple @change=${() => this.requestUpdate()}>
              ${this._left.map(v => html`<option value=${v}>${v}</option>`)}
            </select>
          </div>
        </div>

        <!-- Right list -->
        <div class="panel">
          <div class="header" style="background:${this.headerColor}">${this.rightTitle}</div>
          <div class="controls">
            <button ?disabled=${!(this._rightSelect?.selectedOptions.length > 0)}
                    @click=${() => this._moveSelected('R','L')}>⬅</button>
            <button ?disabled=${this._right.length === 0}
                    @click=${() => this._moveAll('R','L')}>⏪</button>
          </div>
          <div class="listbox">
            <select id="right" multiple @change=${() => this.requestUpdate()}>
              ${this._right.map(v => html`<option value=${v}>${v}</option>`)}
            </select>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('dual-listboxx', DualListboxControl);

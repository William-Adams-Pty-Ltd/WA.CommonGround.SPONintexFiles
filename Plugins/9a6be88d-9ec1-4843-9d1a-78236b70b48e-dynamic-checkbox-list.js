import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class DynamicCheckboxList extends LitElement {

  static properties = {
    value: { type: String } 
  };

  constructor() {
    super();
    this.value = '';
    this.items = [];
  }

  static getMetaConfig() {
    return {
      version: "1.0",
      controlName: "Dynamic checkbox List",
      groupName: "Custom Controls",
      fallbackDisableSubmit: false,

      properties: {
        value: {
          type: "string",
          title: "Code|Checked Data",
          isValueField: true
        }
      }
    };
  }

  // 🔥 NAC VALUE CHANGE HANDLE (like chart plugin)
  updated(changedProps) {
    super.updated?.(changedProps);

    if (changedProps.has('value')) {
      console.log("🔵 NAC VALUE RECEIVED:", this.value);
      this.parseValue();
    }
  }

  // ✅ PARSE INPUT STRING
  parseValue() {
    if (!this.value) {
      console.log("⚠️ No value received");
      this.items = [];
      this.requestUpdate();
      return;
    }

    try {
      let cleanValue = this.value.toString().trim();

      // remove quotes if NAC sends
      if (
        (cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
        (cleanValue.startsWith("'") && cleanValue.endsWith("'"))
      ) {
        cleanValue = cleanValue.slice(1, -1);
      }

      console.log("🟢 Cleaned Value:", cleanValue);

      this.items = cleanValue.split(";").map(row => {
        const [code, checked] = row.split("|");

        return {
          code: code?.trim(),
          checked: Number(checked) === 1 ? 1 : 0
        };
      });

      console.log("✅ Parsed Items:", this.items);

      this.requestUpdate();

    } catch (e) {
      console.error("❌ Parse error:", e);
      this.items = [];
    }
  }

  // ✅ USER CHANGE
  handleChange(index, e) {
    this.items[index].checked = e.target.checked ? 1 : 0;
    this.emitChange();
  }

  // ✅ OUTPUT BACK TO NAC
  emitChange() {
    const output = this.items
      .map(item => `${item.code}|${item.checked}`)
      .join(";");

    console.log("🟣 OUTPUT TO NAC:", output);

    this.dispatchEvent(new CustomEvent('ntx-value-change', {
      bubbles: true,
      composed: true,
      detail: output
    }));
  }

  // ✅ UI
  render() {
    return html`
      <div class="list">
        ${this.items.map((item, i) => html`
          <div class="row">
            <input
              type="checkbox"
              .checked=${item.checked === 1}
              @change=${(e) => this.handleChange(i, e)}
            />
            <span>${item.code}</span>
          </div>
        `)}
      </div>
    `;
  }

  static styles = css`
    .list {
      display: flex;
      flex-direction: column;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 4px;
      font-size: 14px;
    }
  `;
}

customElements.define('dynamic-checkbox-list', DynamicCheckboxList);
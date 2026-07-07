import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class SmartCustomerLookup extends LitElement {

  static properties = {
    recordId: { type: String },
    value: { type: Object }
  };

  constructor() {
    super();
    this.recordId = '';
    this.value = {};
    this.results = [];
    this.timer = null;
  }

  // ✅ Clean MetaConfig (no restriction, full object support)
  static getMetaConfig() {
  return {
    version: "1.0",
      standardProperties: {
        description: true,
        fieldLabel: true,
        defaultValue: false,
        visibility: true,
      },
    controlName: "Smart Customer Lookup",
    fallbackDisableSubmit: false,

    properties: {
      value: {
        type: "object",
        title: "Customer Data",
        isValueField: true,
        properties: {
          CustomerName: { type: "string", title: "Customer Name" },
          CustomerNo: { type: "string", title: "Customer Number" },
          Address: { type: "string", title: "Address" },
          CustomerABN: { type: "string", title: "Customer ABN" },
          PhoneNo: { type: "string", title: "Phone No" },
          State: { type: "string", title: "State" },
          ZipCode: { type: "string", title: "Zip Code" },
          TradingStatus: { type: "string", title: "Trading Status" },
          ExistingCust: { type: "string", title: "Existing Customer" }
        }
      }
    }
  };
}

  handleInput(e) {
    this.recordId = e.target.value;

    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      if (this.recordId && this.recordId.length > 2) {
        this.fetchCustomers();
      } else {
        this.results = [];
        this.requestUpdate();
      }
    }, 400);
  }

  async fetchCustomers() {
    const url = `https://dbsservice.wadams.com.au/DBSSERvice.svc/GetCustNameDetMore/${this.recordId.toUpperCase()}/0`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      this.results = Array.isArray(data) ? data : [];

    } catch (error) {
      console.error('Fetch failed:', error);
      this.results = [];
    }

    this.requestUpdate();
  }

  // 🔥 FINAL OUTPUT (same as User plugin behavior)
  selectCustomer(cust) {

    this.recordId = cust.CustomerName;

    // ✅ FULL OBJECT RETURN
    this.value = cust;

    this.dispatchEvent(new CustomEvent('ntx-value-change', {
      bubbles: true,
      composed: true,
      detail: this.value
    }));

    this.results = [];
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();

    this.handleOutsideClick = (e) => {
      if (!this.contains(e.target)) {
        this.results = [];
        this.requestUpdate();
      }
    };

    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <div class="dropdown-container">

        <input
          class="cssCustomerDDL"
          type="text"
          placeholder="Type customer name..."
          .value=${this.recordId}
          @input=${this.handleInput}
        />

        ${this.results.length > 0 ? html`
          <div class="dropdown-list">
            ${this.results.map(cust => html`
              <div class="dropdown-item" @click=${() => this.selectCustomer(cust)}>

                <div class="cust-number">
                  <span class="label">Number:</span> ${cust.CustomerNo}
                </div>

                <div class="cust-name">
                  <span class="label">Name:</span> ${cust.CustomerName}
                </div>

              </div>
            `)}
          </div>
        ` : ''}

      </div>
    `;
  }

  static styles = css`
    .dropdown-container {
      position: relative;
      width: 100%;
    }

    .cssCustomerDDL {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 999;
      background: #fff;
      border: 1px solid #ccc;
      border-top: none;
      max-height: 250px;
      overflow-y: auto;
      box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    }

    .dropdown-item {
      padding: 10px 12px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }

    .dropdown-item:hover {
      background-color: #f8f8f8;
    }

    .cust-number {
      font-size: 13px;
      color: #333;
    }

    .cust-name {
      font-size: 14px;
      color: #000;
      margin-top: 4px;
    }

    .label {
      font-weight: bold;
      margin-right: 4px;
    }
  `;
}

customElements.define('smart-customer-lookup', SmartCustomerLookup);
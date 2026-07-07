import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class CustomerDropdown extends LitElement {
  static properties = {
    recordId: { type: String },
    jsonOut: { type: String },
    recordId: { type: String },
    CustomerName: { type: String },
    CustomerNo: { type: String },
    TradingStatus: { type: String },
    Address: { type: String },
    ABN: { type: String },
    ContactName: { type: String },
    ContactEmail: { type: String },
    ExistingCust: { type: String },
    TrackRecord: { type: String }
  };

  constructor() {
    super();
    this.recordId = '';
    this.jsonOut = '';
    this.results = [];
  }

  static getMetaConfig() {
    return {
      controlName: 'Customer Dropdown Search Test',
      version: '1.0',
      description: 'Fetches customers from API and shows them in a dropdown overlay under the input',
      groupName: 'Web Integrations',
      fallbackDisableSubmit: true,
      standardProperties: {
        description: true,
        fieldLabel: true,
        visibility: true
      },
      properties: {
        recordId: {
          type: 'string',
          title: 'Search Text',
          description: 'Enter a keyword to search customers'
        },
        jsonOut: {
          type: 'string',
          title: 'Selected Customer',
          isValueField: true
        },
        CustomerName: { type: 'string', title: 'Customer Name' },
        CustomerNo: { type: 'string', title: 'Customer No' },
        TradingStatus: {
          type: 'string',
          title: 'Trading Status',
          isValueField: false
        },
        Address: { type: 'string', title: 'Address' },
        ABN: { type: 'string', title: 'ABN' },
        ContactName: { type: 'string', title: 'Contact Name' },
        ContactEmail: { type: 'string', title: 'Contact Email' },
        ExistingCust: { type: 'string', title: 'Existing Customer' },
        TrackRecord: { type: 'string', title: 'Track Record' }
      },
      events: ["ntx-value-change"]
    };
  }

  // Listen to property changes
  async updated(changedProps) {
    if (changedProps.has('recordId') && this.recordId && this.recordId.length > 2) {
      await this.fetchCustomers();
    } else if (this.recordId.length <= 2) {
      this.results = [];
    }
  }

  // Fetch from API
  async fetchCustomers() {
    // production URL commented out while VPN is down
    // const url = `https://dbsservice.wadams.com.au/DBSSERvice.svc/GetCustNameDetMore/${this.recordId}/0`;

    try {
      // temporary dummy endpoint
      const response = await fetch('https://dummyjson.com/c/2971-a9a9-43ef-af38');

      const data = await response.json();
      console.log(data, 'dummy data');

      if (Array.isArray(data) && data.length > 0) {
        this.results = data;
      } else {
        this.results = [];
      }
    } catch (error) {
      console.error('Fetch failed:', error);
      this.results = [];
    }

    this.requestUpdate(); // refresh render
  }

  // When a user clicks a result
  // selectCustomer(cust) {
  //   this.recordId = cust.CustomerName;
  //   this.jsonOut = JSON.stringify(cust);

  //   // populate other form fields on customer selection
  //   this._setValueById('_531da79ec8b64beeb047876e70460baf', cust.CustomerNo); // Customer No
  //   this._setValueById('_862f0b49f1624315aee3cbafce46e245', cust.TradingStatus); // Trading Status
  //   this._setValueById('_ebe8995a063940d79d1c0dcb3eabf9fd', cust.Address); // Customer Address
  //   this._setValueById('_ae8d6d92907f4534ba199bed86a0e09b', cust.ABN); // ABN
  //   this._setValueById('_d07132ebab06453e909e11ed3bc2a5e5', cust.ContactName); // Contact Name
  //   this._setValueById('_d59b58aff2134d9a8bad0d19cfaeb06c', cust.ContactEmail); // Contact Email
  //   // existing customer radio
  //   this._setRadioByName('_0d2440e4d3e047c195928e4e7eebd8b8', cust.ExistingCust === 'Yes' ? 'YES' : 'NO');
  //   // track record radio
  //   this._setRadioByName('_e6b7ad55a6d34228952a5bbd788806c1', cust.TrackRecord === 'Yes' ? 'YES' : 'NO');
  //   this.jsonOut = JSON.stringify({
  //     CustomerName: cust.CustomerName,
  //     CustomerNo: cust.CustomerNo,
  //     TradingStatus: cust.TradingStatus,
  //     Address: cust.Address,
  //     ABN: cust.ABN,
  //     ContactName: cust.ContactName,
  //     ContactEmail: cust.ContactEmail,
  //     ExistingCust: cust.ExistingCust,
  //     TrackRecord: cust.TrackRecord
  //   });
  //   // Notify Nintex
  //   const event = new CustomEvent('ntx-value-change', {
  //     bubbles: true,
  //     cancelable: false,
  //     composed: true,
  //     detail: this.jsonOut
  //   });
  //   this.dispatchEvent(event);
  //   this.results = [];
  //   this.requestUpdate();
  // }
  selectCustomer(cust) {
    this.recordId = cust.CustomerName;
    this.jsonOut = JSON.stringify(cust);

    this.TradingStatus = cust.TradingStatus;

    const data = [
      cust.CustomerName,
      cust.CustomerName,
      cust.TradingStatus,
      cust.Address,
      cust.CustomerABN,
      cust.ExistingCust
    ]
    // ✅ Set property
    this.jsonOut = data;

    console.log('selectCustomer', {
      jsonOut: this.jsonOut,
      data,
    });

    // Notify Nintex
    const event = new CustomEvent('ntx-value-change', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: [
      cust.CustomerName,
      cust.CustomerName,
      cust.TradingStatus,
      cust.Address,
      cust.CustomerABN,
      cust.ExistingCust
    ]
    });
    this.dispatchEvent(event);

    this.results = [];
  }

  // Hide dropdown if clicking outside
  firstUpdated() {
    document.addEventListener('click', e => {
      if (!this.contains(e.target)) {
        this.results = [];
        this.requestUpdate();
      }
    });
  }

  // helper: set input/textarea value by element id and fire events
  _setValueById(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.value = value || '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }

  // helper: set radio button by name
  _setRadioByName(name, val) {
    const r = document.querySelector(`input[name="${name}"][value="${val}"]`);
    if (r) {
      r.checked = true;
      r.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  render() {
    return html`
    <div class="dropdown-container">
      <input
        class="cssCustomerDDL"
        type="text"
        placeholder="Type customer name..."
        .value=${this.recordId}
        @input=${e => this.recordId = e.target.value}
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
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
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
    margin-top: 4px; /* spacing between number and name */
  }

  .label {
    font-weight: bold;
    color: #000;
    margin-right: 4px;
  }
`;
}

customElements.define('customer-dropdown-test', CustomerDropdown);
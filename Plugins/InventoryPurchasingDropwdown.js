import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class CustomerDropdown extends LitElement {
  static properties = {
    recordId: { type: String },
    jsonOut: { type: String }
  };

  constructor() {
    super();
    this.recordId = '';
    this.jsonOut = '';
    this.results = [];
  }

  static getMetaConfig() {
    return {
      controlName: 'Customer Dropdown Search',
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
        }
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
    const url = `https://dbsservice.wadams.com.au/DBSSERvice.svc/GetCustNameDetMore/${this.recordId}/0`;

    try {
      const response = await fetch(url);
      const data = await response.json();

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
  selectCustomer(cust) {
    this.recordId = cust.CustomerName;
    this.jsonOut = JSON.stringify(cust);

    // Notify Nintex
    const event = new CustomEvent('ntx-value-change', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: this.jsonOut
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

customElements.define('customer-dropdown', CustomerDropdown);

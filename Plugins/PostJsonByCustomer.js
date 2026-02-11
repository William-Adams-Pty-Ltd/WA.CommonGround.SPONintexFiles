import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class JsonPoster extends LitElement {
  static properties = {
    customerList: { type: String },
    jsonOut: { type: String }
  };

  constructor() {
    super();
    this.customerList = '';
    this.jsonOut = '';
  }

  static getMetaConfig() {
    return {
      controlName: 'Post JSON by CustomerList',
      version: '1.0',
      description: 'Posts JSON to a web service and returns result as output',
      groupName: 'Web Integrations',
      fallbackDisableSubmit: true, 
      standardProperties : {
        description: true,
        defaultValue: true,
        fieldLabel: true,
        readOnly: true,
        required: true,
        visibility: true
      },
      properties: {
        customerList: {
          type: 'string',
          title: 'Customer List',
          description: 'Enter a list of customer IDs separated by commas',
        },
        jsonOut: {
          type: 'string',
          title: 'JSON Output',
          isValueField: true
        }
      },
      events: ["ntx-value-change"]
    };
  }

  async updated(changedProps) {
    if (changedProps.has('customerList') && this.customerList) {
      await this.postJsonData();
    }
  }

  async postJsonData() {
  const url = 'https://dbsservice.wadams.com.au/DBSService.svc/GetAnnualSpendsOnCustIDForPartsLoyaltyForm';

  try {
    // Extract text after "||" for each customer, trim, and wrap with single quotes
    const ids = this.customerList
      .split(",")                           // split by comma
      .map(item => item.split("||")[1]?.trim()) // take the part after ||
      .filter(id => id)                     // remove empty/undefined
      .map(id => `'${id}'`)                 // wrap in single quotes
      .join(",");                           // join with commas

    const body = {
      CustomerList: ids
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    this.jsonOut = JSON.stringify(data, null, 2);

    const event = new CustomEvent('ntx-value-change', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: this.jsonOut
    });

    this.dispatchEvent(event);
  } catch (error) {
    console.error('POST failed:', error);
    this.jsonOut = `Error: ${error.message}`;
  }
}


  render() {
    return html`
      <div>
        <label for="customerList">Customer List:</label>
        <input
          id="customerList"
          type="text"
          .value=${this.customerList}
          @input=${e => this.customerList = e.target.value}
        />
        ${this.jsonOut
          ? html`<pre style="margin-top:10px; background:#eee; padding:10px;">${this.jsonOut}</pre>`
          : ''}
      </div>
    `;
  }
}

customElements.define('json-poster', JsonPoster);

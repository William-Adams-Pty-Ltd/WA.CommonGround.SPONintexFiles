import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class JsonFetcher extends LitElement {
  static properties = {
    recordId: { type: String },
    jsonOut: { type: String }
  };

  constructor() {
    super();
    this.recordId = '';
    this.jsonOut = '';
  }

  static getMetaConfig() {
    return {
      controlName: 'Fetch JSON by UsernameID',
      version: '1.0',
      description: 'Fetches JSON from a web service and returns result as outputID',
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
        recordId: {
          type: 'string',
          title: 'Record ID',
          description: 'Enter a numeric ID to fetch JSON',
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
    if (changedProps.has('recordId') && this.recordId) {
      await this.fetchJsonData();
    }
  }

  async fetchJsonData() {
  const url = `https://dbsservice.wadams.com.au/DBSSERvice.svc/GetAllCustomers/${this.recordId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let output = "";

    if (Array.isArray(data) && data.length > 0) {
      // filter where CustomerName contains the recordId (case-insensitive)
      const filtered = data.filter(c =>
        c.CustomerName && c.CustomerName.toUpperCase().includes(this.recordId.toUpperCase())
      );

      if (filtered.length > 0) {
        output = filtered
          .map(c => `${c.CustomerName}||${c.CustomerNo}`)
          .join(",");
      }
    }

    this.jsonOut = output; // empty string if nothing matched

    const event = new CustomEvent('ntx-value-change', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: this.jsonOut
    });

    this.dispatchEvent(event);
  } catch (error) {
    console.error('Fetch failed:', error);
    this.jsonOut = `Error: ${error.message}`;
  }
}


  render() {
    return html`
      <div>
        <label for="username">Record ID:</label>
        <input
          id="recordid"
          type="number"
          .value=${this.recordId}
          @input=${e => this.recordId = e.target.value}
        />
        ${this.jsonOut
          ? html`<pre style="margin-top:10px; background:#eee; padding:10px;">${this.jsonOut}</pre>`
          : ''}
      </div>
    `;
  }
}

customElements.define('json-fetcher2', JsonFetcher);
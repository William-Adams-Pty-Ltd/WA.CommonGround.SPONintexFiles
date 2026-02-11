import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class JsonFetcherSeed extends LitElement {
  static properties = {
    userName: { type: String },
    jsonOut: { type: String }
  };

  constructor() {
    super();
    this.userName = '';
    this.jsonOut = '';
  }

  static getMetaConfig() {
    return {
      controlName: 'Fetch JSON by Seeding',
      version: '1.0',
      description: 'Fetches JSON from a web service and returns result as output',
      groupName: 'Web Integrations',
      fallbackDisableSubmit: true,        
      properties: {
        userName: {
          type: 'string',
          title: 'Random',
          description: 'Enter any value to trigger the fetch',
        },
        jsonOut: {
          type: 'string',
          title: 'JSON Output',
          isValueField: true
        }
      },
      standardProperties: {
      description: true,
        defaultValue: true,
        fieldLabel: true,
        readOnly: true,
        required: true,
        visibility: true 
      },
      events: ["ntx-value-change"]
    };
  }

  async updated(changedProps) {
    if (changedProps.has('userName') && this.userName) {
      await this.fetchJsonData();
    }
  }

  async fetchJsonData() {
    const url = 'https://sponlineapi.wadams.com.au/GetSeeding';

    try {
      const response = await fetch(url);
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
      console.error('Fetch failed:', error);
      this.jsonOut = `Error: ${error.message}`;
    }
  }

  render() {
    return html`
      <div>
        <label for="username">Add any value:</label>
        <input
          id="username"
          type="text"
          .value=${this.userName}
          @input=${e => this.userName = e.target.value}
        />
        ${this.jsonOut
          ? html`<pre style="margin-top:10px; background:#eee; padding:10px;">${this.jsonOut}</pre>`
          : ''}
      </div>
    `;
  }
}

customElements.define('json-fetchseed', JsonFetcherSeed);

import { html, LitElement ,css} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class HelloWorld extends LitElement {


  static styles = css`.container {
    display: flex;
    flex-direction: column;
    gap: 25px;
    max-width: 200px;
  }

  input, button {
    padding: 8px;
    font-size: 14px;
  }`

  static properties = {
    inputText: { type: String },
    EntityType: { type: Object },

  };

  constructor() {
    super();
    this.inputText = '';
    this.EntityType = null;

  }

  render() {
    return html`
      <div class="container">
        <input style="display:none"
          type="text"
          placeholder="Enter text"
          .value=${this.inputText}
          @input=${this._onInputChange}
        />

        <button @click=${this._callWebService}>
          Call ABN Service
        </button>      
      </div>
    `;
  }

  async _callWebService() {
    try {
      // Example web service (replace with your real one)
      const response = await fetch(
        `https://abr.business.gov.au/json/AbnDetails.aspx?callback=abnCallback&abn=${this.inputText}&guid=91a2712e-fafb-466c-a3c2-d1a88756712e`
      );

      if (!response.ok) {
        throw new Error('Service call failed');
      }

      //const data = await response.json();
      const textjson = await response.text();
    const jsonString = textjson.replace(/^abnCallback\(|\)$/g, '');
    const dataResult = JSON.parse(jsonString);

      // Assume service returns { result: "some value" }
      this.EntityType = {entity : dataResult.EntityTypeName, GST : dataResult.Gst};


      
      // Notify Nintex
    const event = new CustomEvent('ntx-value-change', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: this.EntityType
    });
    this.dispatchEvent(event);
    } catch (error) {
      this.EntityType = `Error: ${error.message}`;
    }
  }
  



  static getMetaConfig() {
    return {
      controlName: 'Hello World',
      fallbackDisableSubmit: false,
      groupName: 'Web Integrations',
      version: '1.4',
      properties: {
        inputText: {
          type: 'string',
          title: 'ABN',
          description: 'Please enter the ABN here'
        },
    
        EntityType: {
          title: 'Contact information',
          type: 'object',
          description: 'Contact details',
          isValueField: true,
          properties: {
            entity:{
              type: 'string',
              description: 'Entity name',
              title: 'Name',
            },
            GST: {
              type: 'string',
              description: 'GST From',
              title: 'GST From',
            },
          },
        },
      },
      events: ["ntx-value-change"]
    };
  }
 
}

const elementName = 'hello-world';
customElements.define(elementName, HelloWorld);
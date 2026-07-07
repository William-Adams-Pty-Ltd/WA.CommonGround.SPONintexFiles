import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class PrintButtonPluginurl extends LitElement {
  static styles = css`
    button {
      background-color: #f5f5f5;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 8px 20px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s, box-shadow 0.2s;
    }
    button:hover {
      background-color: #e6e6e6;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `;

  static properties = {
    /** 
     * The full print URL to open 
     * Example: "/Lists/SiteMaintenanceRequest/DispForm.aspx?ID=1&print=true"
     */
    printurl: { type: String },
  };

  static getMetaConfig() {
    return {
      controlName: 'Print ButtonURL',
      version: '1.1',
      description: 'A button that opens a print view in a new window ',
      groupName: 'Utilities',
      fallbackDisableSubmit: false,
      standardProperties: {
        description: true,
        defaultValue: true,
        fieldLabel: true,
        readOnly: true,
        required: true,
        visibility: true,
      },
      properties: {
        printurl: {
          title: 'Print URL',
          type: 'string',
          description: 'The URL to open in a new window for printing',
        },
      },
    };
  }

  openPrintWindow() {
    if (!this.printurl) {
      console.warn('No printurl provided for PrintButtonPlugin');
      return;
    }

    // Browser window options (your original set)
    const windowOptions =
      'toolbar=no,scrollbars=yes,resizable=yes,fullscreen=yes,top=0';

    // Open in new tab or window
    window.open(this.printurl, '_blank', windowOptions);
    return false;
  }

  render() {
    return html`
      <button @click=${this.openPrintWindow}>Print</button>
    `;
  }
}

customElements.define('print-btn', PrintButtonPluginurl);

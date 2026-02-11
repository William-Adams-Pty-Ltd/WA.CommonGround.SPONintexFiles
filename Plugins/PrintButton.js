import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class PrintButtonPlugin extends LitElement {
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

  static getMetaConfig() {
    return {
      controlName: 'Print Button',
      version: '1.0',
      description: 'A button that prints the page when clicked',
      groupName: 'Utilities',
      fallbackDisableSubmit: false,
      standardProperties: {
        description: true,
        defaultValue: true,
        fieldLabel: true,
        readOnly: true,
        required: true,
        visibility: true
      }
    };
  }

  render() {
    return html`
      <button @click=${() => window.print()}>Print</button>
    `;
  }
}



customElements.define('print-button', PrintButtonPlugin);

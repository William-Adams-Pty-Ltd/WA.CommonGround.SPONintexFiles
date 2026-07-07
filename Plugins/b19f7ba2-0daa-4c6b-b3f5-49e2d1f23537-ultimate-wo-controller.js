import { LitElement, html, css }
from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class UltimateWOController extends LitElement {

  static properties = {
    workOrder: { type: String },
    value: { type: Object },
    loading: { type: Boolean },
    error: { type: String }
  };

  constructor() {
    super();
    this.workOrder = "";
    this.value = {};
    this.loading = false;
    this.error = "";
  }

  // â­ OBJECT OUTPUT FOR NAC
  static getMetaConfig() {
    return {
      version: "1.0",
      controlName: "Ultimate WO Controller",
      groupName: "Web Integrations",

      properties: {
        value: {
          type: "object",
          title: "Work Order Data",
          isValueField: true,
          properties: {

            Branch: { type: "string", title: "Branch" },
            CustomerName: { type: "string", title: "Customer Name" },
            CustomerNumber: { type: "string", title: "Customer Number" },
            ModelNumber: { type: "string", title: "Model Number" },
            RepairCost: { type: "number", title: "Repair Cost" },
            RepairDescription: { type: "string", title: "Repair Description" },
            SMU: { type: "string", title: "SMU" },
            SerialNumber: { type: "string", title: "Serial Number" },
            WorkOrderNo: { type: "string", title: "Work Order No" },

            Segment: {
              type: "array",
              title: "Segments",
              items: { type: "string" }
            },

            Servicemen: {
              type: "array",
              title: "Servicemen",
              items: { type: "string" }
            }
          }
        }
      }
    };
  }

  render() {
    return html`
      <div class="container">

        <input
          class="wo-input"
          placeholder="Enter Work Order"
          .value=${this.workOrder}
          @input=${e => this.workOrder = e.target.value}
        />

        <button
          class="wo-button"
          @click=${this.searchWO}
          ?disabled=${this.loading}
        >
          ${this.loading ? "Searching..." : "Search"}
        </button>

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}

      </div>
    `;
  }

  // â­ MAIN SEARCH
  async searchWO() {

    const wo = this.workOrder.trim().toUpperCase().replace(/ /g, '');
    if (!wo) return;

    this.loading = true;
    this.error = "";

    try {

      // ðŸ”¹ DETAILS API
      const detRes = await fetch(
        "https://dummyjson.com/c/8dfa-f6fc-4c9c-988c"
      );
      const details = await detRes.json();

      // ðŸ”¹ SEGMENTS API (PRIORITY)
      const segRes = await fetch(
        "https://dummyjson.com/c/a17a-d2fd-44ae-b1fb"
      );
      const segments = await segRes.json();

      // â­ FINAL OBJECT
      this.value = {

        Branch: details.Branch || "",
        CustomerName: details.CustomerName || "",
        CustomerNumber: details.CustomerNumber || "",
        ModelNumber: details.ModelNumber || "",
        RepairCost: details.RepairCost || null,
        RepairDescription: details.RepairDescription || "",
        SMU: details.SMU || "",
        SerialNumber: details.SerialNumber || "",
        WorkOrderNo: wo,

        // â­ ALWAYS FROM SEGMENT API
        Segment: Array.isArray(segments) ? segments : [],

        Servicemen: details.Servicemen || []

      };

      // â­ SEND TO NAC
      this.dispatchEvent(new CustomEvent('ntx-value-change', {
        bubbles: true,
        composed: true,
        detail: this.value
      }));

    } catch (err) {

      console.error(err);
      this.error = "Failed to load Work Order";

    } finally {
      this.loading = false;
    }
  }

  static styles = css`

    .container {
      width: 100%;
      font-family: Arial, sans-serif;
    }

    /* â­ NAC-style textbox */
    .wo-input {
      width: 100%;
      height: 38px;
      padding: 6px 10px;
      font-size: 14px;

      border: 1px solid #c8c8c8;
      border-radius: 4px;

      box-sizing: border-box;
      background: #fff;
      margin-bottom: 10px;
    }

    .wo-input:focus {
      outline: none;
      border-color: #006BD6;
      box-shadow: 0 0 0 1px #006BD6;
    }

    /* â­ ENTERPRISE BUTTON */
    .wo-button {
      padding: 8px 20px;
      font-size: 14px;
      font-weight: 500;

      border: none;
      border-radius: 4px;

      background: #006BD6;
      color: white;

      cursor: pointer;
      transition: all 0.15s ease;
    }

    /* Hover */
    .wo-button:hover {
      background: #1A7FE0;
    }

    /* Click / Active â†’ Light shade */
    .wo-button:active {
      background: #4DA3F5;
      transform: translateY(1px);
    }

    /* Disabled state */
    .wo-button:disabled {
      background: #9bbfe8;
      cursor: not-allowed;
    }

    .error {
      color: red;
      margin-top: 8px;
    }

  `;
}

customElements.define(
  'ultimate-wo-controller',
  UltimateWOController
);
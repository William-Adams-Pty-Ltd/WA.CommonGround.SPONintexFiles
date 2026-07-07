import { LitElement, html, css }
from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class WOMasterController extends LitElement {

  static properties = {
    workOrder: { type: String },

    value: { type: Object },
    Segment: { type: Array },

    loading: { type: Boolean },
    error: { type: String }
  };

  static styles = css`
    .box { border:1px solid #ccc; padding:12px; border-radius:6px }
    input { padding:6px; width:180px; margin-right:8px }
    button { padding:6px 12px; cursor:pointer }
    .err { color:red; margin-top:6px }
    .ok { color:green; margin-top:6px }
  `;

  constructor() {
    super();
    this.workOrder = "";
    this.value = {};
    this.Segment = [];
    this.loading = false;
    this.error = "";
  }

  static getMetaConfig() {
    return {
      controlName: "WO Master Controller FINAL",
      version: "1.0",
      groupName: "Enterprise WO Suite",

      properties: {

        workOrder: {
          type: "string",
          title: "Work Order"
        },

        value: {
          type: "object",
          title: "Full WO Data",
          isValueField: true
        },

        Segment: {
          type: "array",
          title: "Segments",
          items: { type: "string" }
        }
      }
    };
  }

  async searchWO() {

    if (!this.workOrder) {
      this.error = "Enter Work Order";
      return;
    }

    this.loading = true;
    this.error = "";

    try {

      // 🔹 WORK ORDER API
      const woRes = await fetch(
        "https://dummyjson.com/c/8dfa-f6fc-4c9c-988c"
      );
      const woData = await woRes.json();

      // 🔹 SEGMENT API
      const segRes = await fetch(
        "https://dummyjson.com/c/a17a-d2fd-44ae-b1fb"
      );
      const segData = await segRes.json();

      // 🔹 Ensure array
      let segments =
        segData?.segments ||
        segData ||
        [];

      if (!Array.isArray(segments)) segments = [];

      // 🔹 Build master object
      this.value = {
        ...woData,
        Segment: segments
      };

      // 🔹 Expose segment
      this.Segment = segments;

      // 🔹 Notify NAC
      this.dispatchEvent(new CustomEvent(
        "ntx-value-change",
        {
          bubbles: true,
          composed: true,
          detail: this.value
        }
      ));

    } catch (e) {

      this.error = "API call failed";

    } finally {
      this.loading = false;
    }
  }

  render() {

    return html`
      <div class="box">

        <input
          placeholder="Enter Work Order"
          .value=${this.workOrder}
          @input=${e => this.workOrder = e.target.value}
        />

        <button
          @click=${this.searchWO}
          ?disabled=${this.loading}
        >
          ${this.loading ? "Searching..." : "Search"}
        </button>

        ${this.error
          ? html`<div class="err">${this.error}</div>`
          : ""
        }

        ${this.Segment.length
          ? html`<div class="ok">Segments loaded ✓</div>`
          : ""
        }

      </div>
    `;
  }
}

customElements.define(
  "wo-master-controller-final",
  WOMasterController
);
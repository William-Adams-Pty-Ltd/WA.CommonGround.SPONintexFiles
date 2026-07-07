import { LitElement, html, css } from 
"https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

class CapexAutoPlugin extends LitElement {

  static properties = {
    capex: { type: String },
    details: { type: Object }
  };

  constructor() {
    super();
    this.capex = "";
    this.details = {};
  }

  // ⭐ NAC META FORMAT
  static getMetaConfig() {
    return {
      controlName: "CAPEX Auto Fetch",
      version: "1.0",
      description: "Auto fetch CAPEX data from CEANo field",
      groupName: "Enterprise Plugins",
      properties: {},
      events: ["ntx-value-change"]
    };
  }

  // ===== STATIC DATA =====
  data = {
    "N26/2432": { total:"5592699", approved:"0", pending:"0", remaining:"5592699" },
    "W26/R002": { total:"2000000", approved:"500000", pending:"200000", remaining:"1300000" },
    "W26/R003": { total:"8750000", approved:"2000000", pending:"750000", remaining:"6000000" }
  };

  // ===== START WATCHING FIELD =====
  connectedCallback() {
    super.connectedCallback();

    // Wait for form render
    setTimeout(() => this.watchCEANo(), 1000);
  }

  watchCEANo() {

    const input = document.querySelector(
      '[data-controlname="CEANo"] input, [data-controlname="CEANo"] select'
    );

    if (!input) {
      console.warn("CEANo control not found");
      return;
    }

    // Detect changes automatically
    input.addEventListener("input", () => {
      this.onCEANoChange(input.value);
    });

    input.addEventListener("change", () => {
      this.onCEANoChange(input.value);
    });
  }

  // ===== WHEN USER TYPES =====
  onCEANoChange(value) {

    const cap = (value || "").trim().toUpperCase().replace(/ /g, "");
    if (!cap) return;

    if (!this.data[cap]) return;

    this.capex = cap;
    this.details = this.data[cap];

    this.populateFields();
    this.showPopup();
    this.emitValue();
  }

  // ===== POPULATE OTHER FIELDS (OPTIONAL) =====
  populateFields() {

    const form = this.closest("ntx-form");
    if (!form) return;

    form.setControlValue("TotalBudget", this.details.total || "");
    form.setControlValue("ApprovedBudget", this.details.approved || "");
    form.setControlValue("PendingBudget", this.details.pending || "");
    form.setControlValue("RemainingBudget", this.details.remaining || "");
  }

  // ===== POPUP =====
  showPopup() {

    this.shadowRoot.getElementById("title").innerText = this.capex;
    this.shadowRoot.getElementById("total").innerText = this.details.total;
    this.shadowRoot.getElementById("approved").innerText = this.details.approved;
    this.shadowRoot.getElementById("pending").innerText = this.details.pending;
    this.shadowRoot.getElementById("remaining").innerText = this.details.remaining;

    this.shadowRoot.getElementById("popup").style.display = "block";
  }

  closePopup() {
    this.shadowRoot.getElementById("popup").style.display = "none";
  }

  // ===== EMIT VALUE =====
  emitValue() {
    this.dispatchEvent(new CustomEvent("ntx-value-change", {
      bubbles: true,
      composed: true,
      detail: JSON.stringify({
        capex: this.capex,
        ...this.details
      })
    }));
  }

  render() {
    return html`

      <div id="popup" class="modal">
        <div class="modal-content">

          <div class="header">
            Budget Summary: <span id="title"></span>
            <span class="close" @click=${this.closePopup}>✖</span>
          </div>

          <div class="body">
            <div class="row"><span>Total</span><span id="total"></span></div>
            <div class="row"><span>Approved</span><span id="approved"></span></div>
            <div class="row"><span>Pending</span><span id="pending"></span></div>
            <div class="row"><span>Remaining</span><span id="remaining"></span></div>
          </div>

        </div>
      </div>
    `;
  }

  static styles = css`
    .modal {
      display: none;
      position: fixed;
      z-index: 9999;
      inset: 0;
      background: rgba(0,0,0,0.5);
    }

    .modal-content {
      background: #fff;
      margin: 10% auto;
      width: 400px;
      border-radius: 6px;
      overflow: hidden;
      font-family: Arial;
    }

    .header {
      background: orange;
      padding: 10px;
      font-weight: bold;
      text-align: center;
      position: relative;
    }

    .close {
      position: absolute;
      right: 10px;
      cursor: pointer;
    }

    .body {
      padding: 15px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin: 6px 0;
    }
  `;
}

customElements.define("capex-auto-plugin", CapexAutoPlugin);
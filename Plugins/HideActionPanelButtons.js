import { LitElement, html, css } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

export class HidePanelsCheckbox extends LitElement {
  static properties = {
    checkedState: { type: Boolean, reflect: true },
    hideCancel: { type: Boolean, reflect: true },
    hideSave: { type: Boolean, reflect: true },
    hideSubmit: { type: Boolean, reflect: true }
  };

  static styles = css`
    label {
      font-size: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
    }
    .options {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `;

  /* Detect Nintex RULE updates */
  static get observedAttributes() {
    return ["checkedstate", "hidecancel", "hidesave", "hidesubmit"];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback?.(name, oldVal, newVal);

    const boolVal = newVal === "true";

    if (name === "checkedstate") this.applyHideAll(boolVal);
    if (name === "hidecancel") this.applyHideCancel(boolVal);
    if (name === "hidesave") this.applyHideSave(boolVal);
    if (name === "hidesubmit") this.applyHideSubmit(boolVal);
  }
static getMetaConfig() {
    return {
      controlName: "Hide Action PanelButtons",
      fallbackDisableSubmit: false,
      version: "2.0",
      description: "Hide full Action Panel or individual buttons.",
      groupName: "Utilities",
      standardProperties: {
        description: true,
        fieldLabel: true,
        defaultValue: false,
        visibility: true,
      },
      properties: {
        checkedState: {
          title: "Hide Entire Action Panel",
          type: "boolean",
          defaultValue: false,
        },
        hideCancel: {
          title: "Hide Cancel Button",
          type: "boolean",
          defaultValue: false,
        },
        hideSave: {
          title: "Hide Save Button",
          type: "boolean",
          defaultValue: false,
        },
        hideSubmit: {
          title: "Hide Submit Button",
          type: "boolean",
          defaultValue: false,
        },
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    // Initial render
    this.applyHideAll(this.checkedState);
    this.applyHideCancel(this.hideCancel);
    this.applyHideSave(this.hideSave);
    this.applyHideSubmit(this.hideSubmit);
  }

  /* ------------------------------------------
     MAIN TOGGLE (Hide Entire Action Panel)
  ------------------------------------------- */
  applyHideAll(shouldHide) {
    const styleId = "hide-all-style";
    let existing = document.getElementById(styleId);

    if (shouldHide) {
      if (!existing) {
        const s = document.createElement("style");
        s.id = styleId;
        s.textContent = `
          ntx-action-panel {
            display: none !important;
          }
          header.nx-sp-form-runtime-header {
            display: none !important;
          }
        `;
        document.head.appendChild(s);
      }
    } else {
      existing?.remove();
    }
  }

  /* ------------------------------------------
     INDIVIDUAL BUTTON HIDERS
  ------------------------------------------- */

  applyHideCancel(shouldHide) {
    const id = "hide-cancel-style";
    let ex = document.getElementById(id);

    if (shouldHide) {
      if (!ex) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `
          button[data-e2e="btn-cancel"] {
            display: none !important;
          }
        `;
        document.head.appendChild(s);
      }
    } else {
      ex?.remove();
    }
  }

  applyHideSave(shouldHide) {
    const id = "hide-save-style";
    let ex = document.getElementById(id);

    if (shouldHide) {
      if (!ex) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `
          button[data-e2e="btn-save-and-continue"] {
            display: none !important;
          }
        `;
        document.head.appendChild(s);
      }
    } else {
      ex?.remove();
    }
  }

  applyHideSubmit(shouldHide) {
    const id = "hide-submit-style";
    let ex = document.getElementById(id);

    if (shouldHide) {
      if (!ex) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `
          button[data-e2e="btn-submit"] {
            display: none !important;
          }
        `;
        document.head.appendChild(s);
      }
    } else {
      ex?.remove();
    }
  }

  /* ------------------------------------------
     UI checkbox interaction (optional)
  ------------------------------------------- */
  onToggleAll(e) {
    this.checkedState = e.target.checked;
    this.applyHideAll(this.checkedState);
  }
  onToggleCancel(e) {
    this.hideCancel = e.target.checked;
    this.applyHideCancel(this.hideCancel);
  }
  onToggleSave(e) {
    this.hideSave = e.target.checked;
    this.applyHideSave(this.hideSave);
  }
  onToggleSubmit(e) {
    this.hideSubmit = e.target.checked;
    this.applyHideSubmit(this.hideSubmit);
  }

  /* ------------------------------------------ */
  render() {
    return html`
      <label>
        <input type="checkbox"
          ?checked=${this.checkedState}
          @change=${this.onToggleAll} />
        Hide Entire Action Panel
      </label>

      <div class="options">

        <label>
          <input type="checkbox"
            ?checked=${this.hideCancel}
            @change=${this.onToggleCancel} />
          Hide Cancel Button
        </label>

        <label>
          <input type="checkbox"
            ?checked=${this.hideSave}
            @change=${this.onToggleSave} />
          Hide Save Button
        </label>

        <label>
          <input type="checkbox"
            ?checked=${this.hideSubmit}
            @change=${this.onToggleSubmit} />
          Hide Submit Button
        </label>

      </div>
    `;
  }
}

customElements.define("hide-panels", HidePanelsCheckbox);

import { LitElement, html }
from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class SegmentCheckboxEnterprise extends LitElement {

  static properties = {
    Segment: { type: Array },
    value: { type: String },
    selected: { type: Array }
  };

  constructor() {
    super();
    this.Segment = [];
    this.value = "";
    this.selected = [];
  }

  static getMetaConfig() {
    return {
      controlName: "Segment Checkbox Enterprise FINAL",
      version: "1.0",
      groupName: "Enterprise WO Suite",

      properties: {

        Segment: {
          type: "array",
          title: "Segments",
          items: { type: "string" }
        },

        value: {
          type: "string",
          isValueField: true
        }
      },

      events: ["ntx-value-change"]
    };
  }

  // 🔥 Convert to safe array
  getSegmentsArray() {

    let segs = this.Segment;

    if (typeof segs === "string") {
      try { segs = JSON.parse(segs); }
      catch { segs = []; }
    }

    if (!Array.isArray(segs)) segs = [];

    return segs;
  }

  updated(changed) {

    if (changed.has("Segment")) {
      this.selected = [];
      this.emitValue();
    }
  }

  toggle(seg, checked) {

    let arr = [...this.selected];

    if (checked) arr.push(seg);
    else arr = arr.filter(x => x !== seg);

    this.selected = arr;
    this.emitValue();
  }

  emitValue() {

    this.value = JSON.stringify(this.selected);

    this.dispatchEvent(new CustomEvent(
      "ntx-value-change",
      {
        bubbles: true,
        composed: true,
        detail: this.value
      }
    ));
  }

  render() {

    const segs = this.getSegmentsArray();

    if (!segs.length)
      return html`<div>No segments available</div>`;

    return html`
      ${segs.map(seg => html`
        <label>
          <input
            type="checkbox"
            @change=${e => this.toggle(seg, e.target.checked)}
          />
          ${seg}
        </label><br/>
      `)}
    `;
  }
}

customElements.define(
  "segment-checkbox-enterprise-final",
  SegmentCheckboxEnterprise
);
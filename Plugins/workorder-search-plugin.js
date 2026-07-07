import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class WorkOrderSearch extends LitElement {

  static properties = {
    workOrder: { type: String },
    jsonOut: { type: String }
  };

  constructor() {
    super();
    this.workOrder = '';
    this.jsonOut = '';
    this.segments = [];
  }

  static getMetaConfig() {
    return {
      controlName: 'WorkOrder Search',
      version: '1.0',
      description: 'Search work order and fetch details',
      groupName: 'Web Integrations',

      standardProperties: {
        description: true,
        fieldLabel: true,
        visibility: true
      },

      properties: {
        workOrder: {
          type: 'string',
          title: 'Work Order'
        },

        jsonOut: {
          type: 'string',
          title: 'Output',
          isValueField: true
        }
      },

      events: ["ntx-value-change"]
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

        <button class="search-btn" @click=${this.searchworkorder}>
          Search
        </button>

        ${this.segments.length > 0 ? html`
          <div class="segment-box">

            ${this.segments.map(seg => html`
              <label>
                <input type="checkbox" value="${seg}">
                ${seg}
              </label>
            `)}

          </div>
        `:''}

      </div>
    `;
  }

  async searchworkorder() {

    let workOrderNo = this.workOrder.toUpperCase().replace(/ /g, '');

    if(!workOrderNo){
      alert("Enter Work Order");
      return;
    }

    await this.getWorkOrderDetails(workOrderNo);

    await this.getWorkOrderSegments(workOrderNo);

  }

  async getWorkOrderDetails(workOrderNo) {

    let url = `https://dbsservice.wadams.com.au/DBSSERvice.svc/GetWorkOrderDetails/${workOrderNo}/xxxxxx`;

    try {

      const response = await fetch(url);
      const result = await response.json();

      console.log("WorkOrderDetails", result);

      this.jsonOut = JSON.stringify(result);

      const event = new CustomEvent('ntx-value-change', {
        bubbles: true,
        composed: true,
        detail: this.jsonOut
      });

      this.dispatchEvent(event);

    }
    catch(err) {
      console.error("Error fetching work order", err);
    }

  }

  async getWorkOrderSegments(workOrderNo) {

    let url = `https://dbsservice.wadams.com.au/DBSSERvice.svc/GetWorkOrderSegments/${workOrderNo}`;

    try {

      const response = await fetch(url);
      const result = await response.json();

      console.log("Segments", result);

      if(result && result.length){
        this.segments = result;
      }

      this.requestUpdate();

    }
    catch(err){
      console.error("Segment API error", err);
    }

  }

  static styles = css`

    .container{
      width:100%;
    }

    .wo-input{
      width:70%;
      padding:8px;
      border:1px solid #ccc;
      border-radius:4px;
    }

    .search-btn{
      padding:8px 15px;
      margin-left:10px;
      cursor:pointer;
    }

    .segment-box{
      margin-top:15px;
      border:1px solid #ddd;
      padding:10px;
      background:#fafafa;
    }

    label{
      display:block;
      margin-bottom:5px;
    }

  `;

}

customElements.define('workorder-search-plugin', WorkOrderSearch);
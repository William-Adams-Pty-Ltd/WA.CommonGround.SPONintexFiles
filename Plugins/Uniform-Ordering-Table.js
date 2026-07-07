import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

var CATEGORIES = {};

CATEGORIES["mens-shirts"] = {
  title: "Men's Business Shirts",
  rows: []
};

CATEGORIES["mens-trousers"] = {
  title: "Men Trousers",
  rows: []
};

CATEGORIES["vests-jackets"] = {
  title: "Vests / Jackets / Jumper / Windcheater",
  rows: []
};

CATEGORIES["hi-vis-shirts"] = {
  title: "Hi-Vis Shirts",
  rows: []
};

CATEGORIES["ladies-shirts"] = {
  title: "Ladies Uniform - Shirts,Skirts,Pants,Jumper,Vest",
  rows: []
};

class UniformOrderingTable extends LitElement {

  static getMetaConfig() {
    return {
      controlName: 'Uniform Ordering Form Plugin',
      fallbackDisableSubmit: false,
      version: '1.0',
      groupName: 'Web Integrations',
      properties: {
        MensBusinessShirtXml: {
          type: 'string',
          title: 'Mens Business Shirt Xml',
        },
        MensTrousersXml: {
          type: 'string',
          title: 'Mens Trousers Xml',
        },
        VestsJacketsXml: {
          type: 'string',
          title: 'Vests Xml',
        },    
        HiVisXml: {
          type: 'string',
          title: 'HiVis Xml',
        },      
        LadiesUniformXml: {
          type: 'string',
          title: 'Ladies Uniform Xml',
        },    
        apiBaseUrl: {
          type: 'string',
          title: 'API Base URL'
        },
        jsonOut: {
          type: 'string',
          title: 'JSON Output'
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
    };
  }

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .table-wrapper {
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    thead tr.title-row th {
      background-color: #000;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
    }

    thead tr.header-row th {
      background-color: #f4f4f4;
      color: #333;
      padding: 7px 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }

    tbody tr { border-bottom: 1px solid #e8e8e8; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background-color: #f9f9f9; }

    tbody td {
      padding: 8px 10px;
      vertical-align: middle;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .col-code  { width: 15%; }
    .col-desc  { width: 30%; white-space: normal; }
    .col-avail { width: 15%; }
    .col-size  { width: 20%; }
    .col-qty   { width: 20%; }

    .empty-cell { color: #bbb; }

    .no-rows td {
      color: #999;
      font-style: italic;
      text-align: center;
      padding: 12px;
    }
  `;




  loadCategories() {

    var Url = this.apiBaseUrl;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', Url, false); // false = synchronous
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
  
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error('Failed to load uniform data.');
    }
  
    const uniformJson = JSON.parse(xhr.responseText);

    var UniformDataList = [];
    var uniformItem = {};
    uniformItem.ID = 13;
    uniformItem.Type = "Men Business Shirts";
    uniformItem.Code = "06/BW01";
    uniformItem.Description = "Metro Blue Shirt - Short Sleeve";
    uniformItem.AvailableSizes = "S to 3XL";
    uniformItem.HTMLImage = "https://dsdd";

    UniformDataList.push(uniformItem);

    UniformDataList = uniformJson;

    // Men Business Shirt
    this.MensBusinessShirtXml.forEach(function (row) {

      var rowId = row._a1a2cd12d2894c41ac54ff7eba0b75f6;
      const match = UniformDataList.find(item => String(item.ID) === String(rowId));
      const description = match ? match.Description : null;
      const code = match ? match.Code : null;
      const availablesize = match ? match.AvailableSizes : null;

      CATEGORIES["mens-shirts"].rows.push({
        code: code,
        description: description,
        availableSizes: availablesize,
        size: row._76e60072b3ac471b927758f0b1423fd2,
        quantity: row._e3aa3c7362d943fc9bfb6353f24bdabb
      });
    });

    // Men Trousers
    this.MensTrousersXml.forEach(function (row) {

      var rowId = row._9e9f8cf3fa6244a0b33a0ba41fa8264a;
      const match = UniformDataList.find(item => String(item.ID) === String(rowId));
      const description = match ? match.Description : null;
      const code = match ? match.Code : null;
      const availablesize = match ? match.AvailableSizes : null;

      CATEGORIES["mens-trousers"].rows.push({
        code: code,
        description: description,
        availableSizes: availablesize,
        size: row._bf4d939057ac45d191d0291bba4e6088,
        quantity: row._69cc22f34b6343eb9fe361376ad6c19b
      });
    });

    // Vests Jackets
    this.VestsJacketsXml.forEach(function (row) {

      var rowId = row._6b3b6ebd5abc4573a0d561b17d67d0f8;
      const match = UniformDataList.find(item => String(item.ID) === String(rowId));
      const description = match ? match.Description : null;
      const code = match ? match.Code : null;
      const availablesize = match ? match.AvailableSizes : null;

      CATEGORIES["vests-jackets"].rows.push({
        code: code,
        description: description,
        availableSizes: availablesize,
        size: row._5bf3320d51864d18b98d9f2f1d0fe899,
        quantity: row._0e7f4999fe8e4e45b189c0a3bdc702b6
      });
    });

    // hi-vis-shirts
    this.HiVisXml.forEach(function (row) {

      var rowId = row._a107ea562eff4d35b829991fccbf3fea;
      const match = UniformDataList.find(item => String(item.ID) === String(rowId));
      const description = match ? match.Description : null;
      const code = match ? match.Code : null;
      const availablesize = match ? match.AvailableSizes : null;

      CATEGORIES["hi-vis-shirts"].rows.push({
        code: code,
        description: description,
        availableSizes: availablesize,
        size: row._1e5318adfebd409ba0ef470e786773bc,
        quantity: row._882569f3cae948918f442dec818674da
      });
    });

    // Ladies Uniform
    this.LadiesUniformXml.forEach(function (row) {

      var rowId = row._b971f5a96aaf44cd9d9662dd5b826ebd;
      const match = UniformDataList.find(item => String(item.ID) === String(rowId));
      const description = match ? match.Description : null;
      const code = match ? match.Code : null;
      const availablesize = match ? match.AvailableSizes : null;

      CATEGORIES["ladies-shirts"].rows.push({
        code: code,
        description: description,
        availableSizes: availablesize,
        size: row._d194d4ffc5be49c6a438093c807963f8,
        quantity: row._c455e607b6fd4ac58a1339307349307f
      });
    });

  }
  constructor() {
    super();

  }

  _renderCell(value) {
    return value !== undefined && value !== null && value !== ''
      ? html`${value}`
      : html`<span class="empty-cell">—</span>`;
  }

  _renderTable({ title, rows }) {
    return html`
      <div class="table-wrapper">
        <table>
          <thead>
            <tr class="title-row">
              <th colspan="5"><strong>${title}:</strong></th>
            </tr>
            <tr class="header-row">
              <th class="col-code" >Code</th>
              <th class="col-desc" >Description</th>
              <th class="col-avail">Available Sizes</th>
              <th class="col-size" >Size</th>
              <th class="col-qty"  >Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0
        ? html`<tr class="no-rows"><td colspan="5">No items added yet.</td></tr>`
        : rows.map(row => html`
                  <tr>
                    <td class="col-code" >${this._renderCell(row.code)}</td>
                    <td class="col-desc" >${this._renderCell(row.description)}</td>
                    <td class="col-avail">${this._renderCell(row.availableSizes)}</td>
                    <td class="col-size" >${this._renderCell(row.size)}</td>
                    <td class="col-qty"  >${this._renderCell(row.quantity)}</td>
                  </tr>
                `)
      }
          </tbody>
        </table>
      </div>
    `;
  }

  render() {
    this.loadCategories();
    return html`
      ${Object.values(CATEGORIES).map(cat => this._renderTable(cat))}
    `;
  }
}

customElements.define('uniform-ordering-table', UniformOrderingTable);

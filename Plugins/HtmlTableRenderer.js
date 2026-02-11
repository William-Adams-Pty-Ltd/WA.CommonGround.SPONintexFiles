import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class HtmlTableRendererPlugin extends LitElement {

  static properties = {
    htmlTable: { type: String }
  };

  constructor() {
    super();
    this.htmlTable = '';
  }

  static styles = css`
    :host {
      display: block;
    }

    .table-container {
      overflow-x: auto;
    }

    /* Base outcome cell styling */
    td.outcome-cell {
      color: #fff;
      font-weight: 600;
      text-align: center;
      vertical-align: middle;
      border-radius: 6px;
      padding: 8px 10px;
    }

    td.outcome-approve {
      background-color: #2e7d32;
    }

    td.outcome-reject {
      background-color: #c62828;
    }

    td.outcome-other {
      background-color: #ef6c00;
    }
  `;

  static getMetaConfig() {
    return {
      controlName: 'HTML Table Renderer',
      version: '1.2',
      description: 'Renders an HTML table and styles Outcome cells as rounded blocks',
      groupName: 'Utilities',
      fallbackDisableSubmit: false,

      standardProperties: {
        description: true,
        defaultValue: true,
        fieldLabel: true,
        readOnly: true,
        required: true,
        visibility: true
      },

      properties: {
        htmlTable: {
          type: 'string',
          title: 'HTML Table',
          description: 'Paste a valid HTML table string',
          defaultValue: '',
          isRequired: false
        }
      }
    };
  }

  /**
   * Styles Outcome column cells
   */
  processTable(htmlString) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlString;

    const table = wrapper.querySelector('table');
    if (!table) return htmlString;

    // Find "Outcome" column index
    const headers = Array.from(table.querySelectorAll('th'));
    const outcomeIndex = headers.findIndex(
      th => th.textContent.trim().toLowerCase() === 'outcome'
    );

    if (outcomeIndex === -1) return htmlString;

    // Process rows
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      if (rowIndex === 0) return;

      const cells = row.querySelectorAll('td');
      const cell = cells[outcomeIndex];
      if (!cell) return;

      const value = cell.textContent.trim().toLowerCase();

      cell.classList.add('outcome-cell');

      if (value === 'approve') {
        cell.classList.add('outcome-approve');
      } else if (value === 'reject') {
        cell.classList.add('outcome-reject');
      } else {
        cell.classList.add('outcome-other');
      }
    });

    return wrapper.innerHTML;
  }

  render() {
    if (!this.htmlTable) return html``;

    const processedHtml = this.processTable(this.htmlTable);

    return html`
      <div class="table-container"
           .innerHTML=${processedHtml}>
      </div>
    `;
  }
}

customElements.define('html-table', HtmlTableRendererPlugin);

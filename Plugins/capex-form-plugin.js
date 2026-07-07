import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class CapexFormPlugin extends LitElement {

  static getMetaConfig() {
    return {
      controlName: 'CAPEX Form Plugin',
      fallbackDisableSubmit: false,
      version: '2.0',
      properties: {
        ceaNo: {
          type: 'string',
          title: 'CEA Number',
          isValueField: true  // âœ… This enables two-way binding
        },
        apiBaseUrl: {
          type: 'string',
          title: 'API Base URL'
        },
        jsonOut: {
          type: 'string',
          title: 'JSON Output'
        }
      }
    };
  }

  static properties = {
    ceaNo: { type: String },
    apiBaseUrl: { type: String },
    jsonOut: { type: String },

    _open: { state: true },
    _loading: { state: true },
    _error: { state: true },
    _summary: { state: true }
  };

  constructor() {
    super();
    this.apiBaseUrl = 'https://SPOnlineAPITest.wadams.com.au';
    this.ceaNo = '';
    this.jsonOut = '';

    this._open = false;
    this._loading = false;
    this._error = '';
    this._summary = null;
  }


  static styles = css`
    .btn {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: #0078d4;
      border: none;
      color: #fff;
      cursor: pointer;
      font-weight: bold;
    }
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    }
    .box {
      background: #fff;
      width: 360px;
      border-radius: 6px;
      overflow: hidden;
    }
    .hdr {
      background: #d9d9d9;
      padding: 8px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
    }
    table {
      width: 100%;
      font-size: 13px;
      border-collapse: collapse;
    }
    td {
      padding: 6px 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .yellow { background: #ffc000; text-align: center; }
    .footer { background: #f3f2f1; font-weight: 700; }
    .err {
      padding: 10px;
      background: #fde7e9;
      color: #a4262c;
    }
  `;


  // _getCEA() {
  //   // Method 1: Find by the unique class wrapper, then get input inside
  //   const wrapper = document.querySelector('.nf-CEANo-control');
  //   if (wrapper) {
  //     const input = wrapper.querySelector('input');
  //     if (input?.value) {
  //       return input.value.trim();
  //     }
  //   }

  //   // Method 2: Find input by data attribute (more reliable across form versions)
  //   const inputByData = document.querySelector('[data-e2e$="-input"]');
  //   if (inputByData?.value && inputByData.closest('.nf-CEANo-control')) {
  //     return inputByData.value.trim();
  //   }

  //   // Method 3: Fallback to bound property (with proper type checking)
  //   if (this.ceaNo) {
  //     // Handle if ceaNo is an object or other type
  //     if (typeof this.ceaNo === 'string') {
  //       return this.ceaNo.trim();
  //     }
  //     // If it's an object, try to get a value property
  //     if (typeof this.ceaNo === 'object' && this.ceaNo.value) {
  //       return String(this.ceaNo.value).trim();
  //     }
  //     // Convert to string as last resort
  //     return String(this.ceaNo).trim();
  //   }

  //   return '';
  // }
  _getCEA() {
    let rawValue = '';

    // Method 1: From wrapper
    const wrapper = document.querySelector('.nf-CEANo-control');
    if (wrapper) {
      const input = wrapper.querySelector('input');
      if (input?.value) {
        rawValue = input.value.trim();
      }
    }

    // Method 2: From data attribute
    if (!rawValue) {
      const inputByData = document.querySelector('[data-e2e$="-input"]');
      if (inputByData?.value && inputByData.closest('.nf-CEANo-control')) {
        rawValue = inputByData.value.trim();
      }
    }

    // Method 3: From bound property
    if (!rawValue && this.ceaNo) {
      if (typeof this.ceaNo === 'string') {
        rawValue = this.ceaNo.trim();
      } else if (typeof this.ceaNo === 'object' && this.ceaNo.value) {
        rawValue = String(this.ceaNo.value).trim();
      } else {
        rawValue = String(this.ceaNo).trim();
      }
    }

    // 🔥 CLEAN LOGIC: Remove everything before and including '#'
    if (rawValue.includes('#')) {
      return rawValue.split('#')[1]?.trim() || '';
    }

    return rawValue;
  }

  _validateCEAFormat(cea) {
    // return cea && cea.length > 0;
    // Original strict validation (restore after testing):
    const pattern = /^[A-Z]\d{2}\/[A-Z0-9]{4}$/;
    return pattern.test(cea);
  }

  // async _openPopup() {
  //   const cea = this._getCEA();
  //   if (!this._validateCEAFormat(cea)) {
  //     this._error = 'Invalid CEA Number format.';
  //     return;
  //   }

  //   this._open = true;
  //   await this._loadBudget();
  // }
  async _openPopup() {
    const cea = this._getCEA();

    console.log('Retrieved CEA:', cea); // âœ… Debug log

    if (!cea) {
      this._error = 'CEA Number is empty. Please enter a value.';
      this._open = true; // âœ… Show popup with error
      return;
    }

    if (!this._validateCEAFormat(cea)) {
      this._error = `Invalid CEA format: "${cea}"\nExpected format: X##/####\nExample: W26/0012`;
      this._open = true; // âœ… Show popup with error
      return;
    }

    this._open = true;
    await this._loadBudget();
  }
  _close() {
    this._open = false;
  }


  // getCapexSettingsApiUrl(cea) {
  //   const siteUrl = "https://intranet.wadams.com.au/sites/electronicforms";
  //   const listTitle = "CapexSettings";

  //   // Encode the search value safely
  //   const searchValue = encodeURIComponent(cea);

  //   const apiUrl =
  //     siteUrl +
  //     "/_api/web/lists/GetByTitle('" + listTitle + "')/items" +
  //     "?$select=type,Cost_x0020_Center,Description,Justification,Title,ReportingLevel" +
  //     "&$filter=(" +
  //     "(" +
  //     "substringof('" + searchValue + "',type)" +
  //     " or substringof('" + searchValue + "',Cost_x0020_Center)" +
  //     " or substringof('" + searchValue + "',ReportingLevel)" +
  //     " or substringof('" + searchValue + "',Description)" +
  //     " or substringof('" + searchValue + "',Justification)" +
  //     ")" +
  //     " and (RoutingEnabled eq 1)" +
  //     ")" +
  //     "&$top=10";

  //   return apiUrl;
  // }

  // getCapexBudgetApiUrl(cea) {
  //   const siteUrl = "https://intranet.wadams.com.au/sites/electronicforms";
  //   const listTitle = "CapexSettings";

  //   // Encode CEA safely (handles /, spaces, quotes, etc.)
  //   const encodedCEA = encodeURIComponent(cea);

  //   const apiUrl =
  //     siteUrl +
  //     "/_api/web/lists/GetByTitle('" + listTitle + "')/items" +
  //     "?$select=type,Budget" +
  //     "&$filter=type eq '" + encodedCEA + "'";

  //   return apiUrl;
  // }

  _getCapexSettingsUrl(cea) {
    return `${this.apiBaseUrl}/GetCapexSettings?CEAVal=${encodeURIComponent(cea)}`;
  }

  _getCapexBudgetInfoUrl(cea) {
    return `${this.apiBaseUrl}/GetCapexBudgetInfo?CEAVal=${encodeURIComponent(cea)}`;
  }

  // async _loadBudget() {
  //   const cea = this._getCEA();

  //   if (!cea) {
  //     this._error = 'CEA number is required.';
  //     return;
  //   }

  //   if (!this._validateCEAFormat(cea)) {
  //     this._error = 'Invalid CEA number format.';
  //     return;
  //   }

  //   this._loading = true;
  //   this._error = '';
  //   this._summary = null;

  //   try {

  //     const settingsRes = await fetch(
  //       // this._getCapexSettingsUrl(cea),
  //       "https://dummyjson.com/c/c59f-54c6-4c36-9a8f",
  //       { headers: { Accept: 'application/json' } }
  //     );

  //     if (!settingsRes.ok) {
  //       throw new Error('Failed to validate CEA.');
  //     }

  //     const settingsJson = await settingsRes.json();
  //     const settings = settingsJson?.d?.results ?? [];

  //     if (!settings.length) {
  //       this._error = 'CEA number not found or inactive.';
  //       return;
  //     }


  //     const budgetRes = await fetch(
  //       // this._getCapexBudgetInfoUrl(cea),
  //       "https://dummyjson.com/c/c59f-54c6-4c36-9a8f",
  //       { headers: { Accept: 'application/json' } }
  //     );

  //     if (!budgetRes.ok) {
  //       throw new Error('Failed to load budget data.');
  //     }

  //     const budgetJson = await budgetRes.json();
  //     const items = budgetJson?.d?.results ?? [];

  //     let approved = 0;
  //     let pending = 0;

  //     items.forEach(r => {
  //       let exclude = 0;

  //       try {
  //         const xml = new DOMParser().parseFromString(
  //           r.CapexExpenditure || '',
  //           'text/xml'
  //         );

  //         xml.querySelectorAll('Item').forEach(i => {
  //           if (i.querySelector('budget')?.textContent === 'true') {
  //             exclude += parseFloat(
  //               i.querySelector('amount')?.textContent || 0
  //             );
  //           }
  //         });
  //       } catch (_) { }

  //       const auth = parseFloat((r.CapexAuthAmount || '0').replace(/,/g, ''));
  //       const gst = parseFloat((r.CapexExpenditureGST || '0').replace(/,/g, ''));
  //       const net = auth - gst - exclude;

  //       if (r.eWorkflowStatus === 'Approved') approved += net;
  //       if (r.eWorkflowStatus === 'Pending') pending += net;
  //     });


  //     const total = parseFloat(settings[0].Budget);
  //     const remaining = total - approved - pending;

  //     this._summary = {
  //       cea,
  //       total,
  //       approved,
  //       pending,
  //       remaining
  //     };
  //     this.jsonOut = JSON.stringify(this._summary);

  //     this.dispatchEvent(
  //       new CustomEvent('ntx-value-change', {
  //         bubbles: true,
  //         composed: true,
  //         detail: { name: 'jsonOut', value: this.jsonOut }
  //       })
  //     );

  //   } catch (err) {
  //     console.error(err);
  //     this._error = 'Unable to retrieve budget information.';
  //   } finally {
  //     this._loading = false;
  //   }
  // }
  async _loadBudget() {
    // ✅ Get and clean CEA
    const cea = this._cleanCEA(this._getCEA());

    if (!cea) {
      this._error = 'CEA number is required.';
      return;
    }

    if (!this._validateCEAFormat(cea)) {
      this._error = 'Invalid CEA number format.';
      return;
    }

    this._loading = true;
    this._error = '';
    this._summary = null;

    try {
      const settingsRes = await fetch(
        "https://dummyjson.com/c/c59f-54c6-4c36-9a8f",
        { headers: { Accept: 'application/json' } }
      );

      if (!settingsRes.ok) {
        throw new Error('Failed to validate CEA.');
      }

      const settingsJson = await settingsRes.json();
      const settings = settingsJson?.d?.results ?? [];

      if (!settings.length) {
        this._error = 'CEA number not found or inactive.';
        return;
      }

      const budgetRes = await fetch(
        "https://dummyjson.com/c/c59f-54c6-4c36-9a8f",
        { headers: { Accept: 'application/json' } }
      );

      if (!budgetRes.ok) {
        throw new Error('Failed to load budget data.');
      }

      const budgetJson = await budgetRes.json();
      const items = budgetJson?.d?.results ?? [];

      let approved = 0;
      let pending = 0;

      items.forEach(r => {
        let exclude = 0;

        try {
          const xml = new DOMParser().parseFromString(
            r.CapexExpenditure || '',
            'text/xml'
          );

          xml.querySelectorAll('Item').forEach(i => {
            if (i.querySelector('budget')?.textContent === 'true') {
              exclude += parseFloat(
                i.querySelector('amount')?.textContent || 0
              );
            }
          });
        } catch (_) { }

        const auth = parseFloat((r.CapexAuthAmount || '0').replace(/,/g, ''));
        const gst = parseFloat((r.CapexExpenditureGST || '0').replace(/,/g, ''));
        const net = auth - gst - exclude;

        if (r.eWorkflowStatus === 'Approved') approved += net;
        if (r.eWorkflowStatus === 'Pending') pending += net;
      });

      const total = parseFloat(settings[0].Budget);
      const remaining = total - approved - pending;

      this._summary = {
        cea,
        total,
        approved,
        pending,
        remaining
      };

      this.jsonOut = JSON.stringify(this._summary);

      this.dispatchEvent(
        new CustomEvent('ntx-value-change', {
          bubbles: true,
          composed: true,
          detail: { name: 'jsonOut', value: this.jsonOut }
        })
      );

    } catch (err) {
      console.error(err);
      this._error = 'Unable to retrieve budget information.';
    } finally {
      this._loading = false;
    }
  }

  render() {
    return html`
      <button class="btn" @click=${this._openPopup}> &#8505;</button>
    
      ${this._open ? html`
        <div class="overlay" @click=${e => e.target === e.currentTarget && this._close()}>
          <div class="box">
            <div class="hdr">
              Budget summary: ${this._summary?.cea || ''}
              <span style="cursor:pointer" @click=${this._close}>&times;</span>
            </div>

            ${this._error ? html`
              <div class="err">${this._error}</div>
            ` : this._summary ? html`
              <table>
                <tr class="yellow"><td colspan="2">${this._summary.cea}</td></tr>
                <tr><td>Total Budget</td><td>${this._summary.total.toFixed(2)}</td></tr>
                <tr><td colspan="2">Less: Capex raised</td></tr>
                <tr><td>&nbsp;&nbsp;Approved</td><td>${this._summary.approved.toFixed(2)}</td></tr>
                <tr><td>&nbsp;&nbsp;Pending</td><td>${this._summary.pending.toFixed(2)}</td></tr>
                <tr class="footer"><td>Remaining Balance</td><td>${this._summary.remaining.toFixed(2)}</td></tr>
              </table>
            ` : ''}
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('capex-form-plugin', CapexFormPlugin);
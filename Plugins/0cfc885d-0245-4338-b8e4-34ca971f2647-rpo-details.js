import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class GetRPODetails extends LitElement {
  static properties = {
    customerList: { type: String },
    jsonOut: { type: Object }
  };

  constructor() {
    super();
    this.customerList = '';
    this.jsonOut = null;
  }

  static getMetaConfig() {
    return {
      controlName: 'Get RPO Details',
      version: '1.0',
      description: 'Posts JSON to a web service and returns RPO details',
      groupName: 'Web Integrations',
      fallbackDisableSubmit: true,
      standardProperties: {
        description: true,
        defaultValue: true,
        fieldLabel: true,
        readOnly: true,
        required: true,
        visibility: true
      },
      properties: {
        customerList: {
          type: 'string',
          title: 'Customer List',
          description: 'Enter a list of customer IDs separated by commas',
        },
        jsonOut: {
          type: 'object',
          title: 'JSON Output',
          isValueField: true,
          properties: {
            CustomerName: {
              type: 'string',
              description: 'CustomerName',
              title: 'CustomerName',
            },
            CustomerNumber: {
              type: 'string',
              description: 'CustomerNumber',
              title: 'CustomerNumber',
            },
            CustomerAddress: {
              type: 'string',
              description: 'CustomerAddress',
              title: 'CustomerAddress',
            },
            ExistingCustomer: {
              type: 'string',
              description: 'ExistingCustomer',
              title: 'ExistingCustomer',
            },
            TradingStatus: {
              type: 'string',
              description: 'TradingStatus',
              title: 'TradingStatus',
            },
            TrackRecord: {
              type: 'string',
              description: 'TrackRecord',
              title: 'TrackRecord',
            },
            ABN: {
              type: 'string',
              description: 'ABN',
              title: 'ABN',
            },
            ContactName: {
              type: 'string',
              description: 'ContactName',
              title: 'ContactName',
            },
            ContactEmail: {
              type: 'string',
              description: 'ContactEmail',
              title: 'ContactEmail',
            },
            ExtensiononExtension: {
              type: 'string',
              description: 'ExtensiononExtension',
              title: 'ExtensiononExtension',
            },
            ExtensiononExtensionRPONo: {
              type: 'string',
              description: 'ExtensiononExtensionRPONo',
              title: 'ExtensiononExtensionRPONo',
            },
            Department: {
              type: 'string',
              description: 'Department',
              title: 'Department',
            },
            ModelOffer: {
              type: 'string',
              description: 'ModelOffer',
              title: 'ModelOffer',
            },
            MachineID: {
              type: 'string',
              description: 'MachineID',
              title: 'MachineID',
            },
            SerialNo: {
              type: 'string',
              description: 'SerialNo',
              title: 'SerialNo',
            },
            CATSupport: {
              type: 'string',
              description: 'CATSupport',
              title: 'CATSupport',
            },
            InterestAccured: {
              type: 'string',
              description: 'InterestAccured',
              title: 'InterestAccured',
            },
            SellingPrice: {
              type: 'string',
              description: 'SellingPrice',
              title: 'SellingPrice',
            },
            PercentageGP: {
              type: 'string',
              description: 'PercentageGP',
              title: 'PercentageGP',
            },
            Term: {
              type: 'string',
              description: 'Term',
              title: 'Term',
            },
            RatePerMonth: {
              type: 'string',
              description: 'RatePerMonth',
              title: 'RatePerMonth',
            },
            RentalRate: {
              type: 'string',
              description: 'RentalRate',
              title: 'RentalRate',
            },
            RebatePercentage: {
              type: 'string',
              description: 'RebatePercentage',
              title: 'RebatePercentage',
            },
            Rebate: {
              type: 'string',
              description: 'Rebate',
              title: 'Rebate',
            },
            ConversionPrice: {
              type: 'string',
              description: 'ConversionPrice',
              title: 'ConversionPrice',
            },
            CATSupportExt: {
              type: 'string',
              description: 'CATSupportExt',
              title: 'CATSupportExt',
            },
            InterestAccuredExt: {
              type: 'string',
              description: 'InterestAccuredExt',
              title: 'InterestAccuredExt',
            },
            SellingPriceExt: {
              type: 'string',
              description: 'SellingPriceExt',
              title: 'SellingPriceExt',
            },
            PercentageGPExt: {
              type: 'string',
              description: 'PercentageGPExt',
              title: 'PercentageGPExt',
            },
            TermExt: {
              type: 'string',
              description: 'TermExt',
              title: 'TermExt',
            },
            RatePerMonthExt: {
              type: 'string',
              description: 'RatePerMonthExt',
              title: 'RatePerMonthExt',
            },
            RentalRateExt: {
              type: 'string',
              description: 'RentalRateExt',
              title: 'RentalRateExt',
            },
            RebatePercentageExt: {
              type: 'string',
              description: 'RebatePercentageExt',
              title: 'RebatePercentageExt',
            },
            RebateExt: {
              type: 'string',
              description: 'RebateExt',
              title: 'RebateExt',
            },
            TotalRebateExt: {
              type: 'string',
              description: 'TotalRebateExt',
              title: 'TotalRebateExt',
            },
            ConversionPriceExt: {
              type: 'string',
              description: 'ConversionPriceExt',
              title: 'ConversionPriceExt',
            },
          },
        }
      },
      events: ["ntx-value-change"]
    };
  }

  async updated(changedProps) {
    if (changedProps.has('customerList') && this.customerList) {
      await this.postJsonData();
    }
  }

  async postJsonData() {
    try {
      console.log(this.customerList, 'this.customerList');

      // 🔹 Step 1: Clean SharePoint value (e.g., "80;#RPO80")
      const rawValue = this.customerList || '';

      let cleanNumber = '';

      if (rawValue.includes(';#')) {
        const parts = rawValue.split(';#');
        // parts[1] = "RPO80" → extract number
        const match = parts[1].match(/\d+/);
        cleanNumber = match ? match[0] : '';
      } else {
        // fallback if already clean like "80" or "RPO80"
        const match = rawValue.match(/\d+/);
        cleanNumber = match ? match[0] : '';
      }

      if (!cleanNumber) {
        throw new Error('Invalid RPO number');
      }

      // 🔹 Step 2: Build correct API param
      const rpoNumber = `RPO${cleanNumber}`;
      const encodedParam = encodeURIComponent(`'${rpoNumber}'`);

      const url = `https://sponlineapi.azurewebsites.net//GetRPODetails?RPONumber=${encodedParam}`;
      console.log('Final API URL:', url);

      // 🔹 Step 3: Call API
      const response = await fetch(url);

      const textjson = await response.text();
      const jsonString = textjson.replace(/^abnCallback\(|\)$/g, '');
      const dataResult = JSON.parse(jsonString);

      console.log('API Response:', { textjson, jsonString, dataResult });

      if (!dataResult || dataResult.length === 0) {
        throw new Error('No data returned from API');
      }

      const rpoDetail = dataResult[0];

      if (!rpoDetail) {
        throw new Error('Invalid data structure returned from API');
      }

      // 🔹 Step 4: Map response
      this.jsonOut = {
        CustomerName: rpoDetail.Customer_x0020_Name,
        CustomerNumber: rpoDetail.Customer_x0020_Number,
        CustomerAddress: rpoDetail.Customer_x0020_Address,
        ExistingCustomer: rpoDetail.Existing_x0020_Customer,
        TradingStatus: rpoDetail.Trading_x0020_Status,
        TrackRecord: rpoDetail.Track_x0020_Record,
        ABN: rpoDetail.ABN,
        ContactName: rpoDetail.Contact_x0020_Name,
        ContactEmail: rpoDetail.Contact_x0020_Email_x0020_Addres,
        ExtensiononExtension: rpoDetail.ExtensiononExtension,
        ExtensiononExtensionRPONo: rpoDetail.ExtensiononExtensionRPONo,
        Department: rpoDetail.Department,
        ModelOffer: rpoDetail.Model_x0020_Offer,
        MachineID: rpoDetail.Machine_x0020_ID,
        SerialNo: rpoDetail.Serial_x0020_No,
        CATSupport: rpoDetail.CAT_x0020_Support,
        InterestAccured: rpoDetail.Interest_x0020_Accured,
        SellingPrice: rpoDetail.Selling_x0020_Price,
        PercentageGP: rpoDetail.Percentage_x0020_GP,
        Term: rpoDetail.Term,
        RatePerMonth: rpoDetail.Rate_x0020_Per_x0020_Month,
        RentalRate: rpoDetail.Rental_x0020_Rate,
        RebatePercentage: rpoDetail.Rebate_x0020_Percentage,
        Rebate: rpoDetail.Rebate,
        ConversionPrice: rpoDetail.Conversion_x0020_Price,
        CATSupportExt: rpoDetail.CAT_x0020_Support_x0020_Ext,
        InterestAccuredExt: rpoDetail.Interest_x0020_Accured_x0020_Ext,
        SellingPriceExt: rpoDetail.Selling_x0020_Price_x0020_Ext,
        PercentageGPExt: rpoDetail.Percentage_x0020_GP_x0020_Ext,
        TermExt: rpoDetail.Term_x0020_Ext,
        RatePerMonthExt: rpoDetail.Rate_x0020_Per_x0020_Month_x0020,
        RentalRateExt: rpoDetail.Rental_x0020_Rate_x0020_Ext,
        RebatePercentageExt: rpoDetail.Rebate_x0020_Percentage_x0020_Ex,
        RebateExt: rpoDetail.Rebate_x0020_Ext,
        TotalRebateExt: rpoDetail.Total_x0020_Rebate_x0020_Ext,
        ConversionPriceExt: rpoDetail.Conversion_x0020_Price_x0020_Ext
      };

      // 🔹 Step 5: Dispatch to Nintex Form
      const event = new CustomEvent('ntx-value-change', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: this.jsonOut
      });

      this.dispatchEvent(event);

    } catch (error) {
      console.error('POST failed:', error);
      this.jsonOut = `Error: ${error.message}`;
    }
  }


  render() {
    return html`
      <div>
        <label for="customerList">Customer List:</label>
        <input
          id="customerList"
          type="text"
          .value=${this.customerList}
          @input=${e => this.customerList = e.target.value}
        />
        ${this.jsonOut
        ? html`<pre style="margin-top:10px; background:#eee; padding:10px;">${this.jsonOut}</pre>`
        : ''}
      </div>
    `;
  }
}

customElements.define('rpo-details', GetRPODetails);
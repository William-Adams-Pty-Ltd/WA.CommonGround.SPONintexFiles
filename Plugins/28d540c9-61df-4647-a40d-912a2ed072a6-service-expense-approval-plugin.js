import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

// FORM_IDS defined below in the main helpers section


/**
 * setFormInput — sets a plain text input by data-e2e id
 */
function setFormInput(e2eId, value) {
  const el = document.querySelector('[data-e2e="' + e2eId + '"]');
  if (!el) { console.warn('setFormInput: not found', e2eId); return; }
  el.value = value || '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * getFormInput — reads a plain text input by data-e2e id
 */
function getFormInput(e2eId) {
  const el = document.querySelector('[data-e2e="' + e2eId + '"]');
  return el ? el.value : '';
}

/**
 * setNtxChoiceDropdown — sets a ntx-simple-select-single (ng-select choice field)
 * by its data-e2e id (e.g. segment dropdown).
 * These fields have pre-loaded options — find and click the matching .ng-option.
 * Falls back to opening the dropdown first if options aren't visible yet.
 */
function setNtxChoiceDropdown(e2eId, value, retries) {
  if (!value) return;
  retries = retries === undefined ? 6 : retries;

  const wrapper = document.querySelector('[data-e2e="' + e2eId + '"]');
  if (!wrapper) { console.warn('setNtxChoiceDropdown: not found', e2eId); return; }

  function tryClick() {
    // Try to find already-rendered options first
    const options = wrapper.querySelectorAll('.ng-option');
    if (options.length > 0) {
      let matched = null;
      options.forEach(function (opt) {
        if (!matched && (opt.textContent || '').trim().toLowerCase() === value.toLowerCase()) matched = opt;
      });
      const toClick = matched || null;
      if (toClick) { toClick.click(); console.log('setNtxChoiceDropdown: clicked', value); return true; }
    }
    return false;
  }

  // Open the dropdown first (click the container)
  const container = wrapper.querySelector('.ng-select-container');
  if (container) container.click();

  let attempts = 0;
  const poll = setInterval(function () {
    attempts++;
    if (tryClick()) { clearInterval(poll); return; }
    if (attempts >= retries) {
      clearInterval(poll);
      console.warn('setNtxChoiceDropdown: gave up for', value, 'in', e2eId);
    }
  }, 200);
}

/**
 * setNtxServicemenCheckboxes — populates the ntx-multi-choice-checkbox (Servicemen)
 * by data-e2e id from the HTML snapshot.
 *
 * The Nintex multi-choice field renders one checkbox per configured option.
 * For API-driven servicemen (not pre-configured), we inject checkboxes into
 * the nx-checkbox-group div directly.
 *
 * @param {string[]} servicemenList  array of "EmpID - Initial Surname" strings
 */
function setNtxServicemenCheckboxes(servicemenList) {
  const GROUP_ID = FORM_IDS.servicemenGroup;
  const groupWrapper = document.querySelector('[data-e2e="' + GROUP_ID + '"]');
  if (!groupWrapper) { console.warn('setNtxServicemenCheckboxes: group not found', GROUP_ID); return; }

  const checkboxGroup = groupWrapper.querySelector('.nx-checkbox-group');
  if (!checkboxGroup) { console.warn('setNtxServicemenCheckboxes: .nx-checkbox-group not found'); return; }

  // Remove previously injected dynamic checkboxes (keep static ones like NA)
  checkboxGroup.querySelectorAll('.nx-checkbox.dynamic-sm').forEach(el => el.remove());

  if (!servicemenList || !servicemenList.length) return;

  servicemenList.forEach(function (item) {
    const safeId = GROUP_ID + '_' + item.replace(/[^a-zA-Z0-9]/g, '_');

    const div = document.createElement('div');
    div.className = 'nx-checkbox dynamic-sm';

    const label = document.createElement('label');
    label.setAttribute('data-e2e', 'set-' + safeId);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = safeId;
    input.name = GROUP_ID;
    input.value = item;
    input.setAttribute('data-e2e', 'get-' + safeId);
    input.addEventListener('change', function () {
      console.log('Serviceman toggled:', item, input.checked);
    });

    const container = document.createElement('div');
    container.className = 'nx-checkbox-container';

    const faux = document.createElement('span');
    faux.className = 'nx-checkbox-faux';

    const lbl = document.createElement('span');
    lbl.className = 'nx-checkbox-label';
    lbl.textContent = item;

    container.appendChild(faux);
    container.appendChild(lbl);
    label.appendChild(input);
    label.appendChild(container);
    div.appendChild(label);
    checkboxGroup.appendChild(div);
  });

  console.log('setNtxServicemenCheckboxes: injected', servicemenList.length, 'checkboxes');
}

// ─────────────────────────────────────────────────────────────────────────────
// Please-wait overlay helpers (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function _ensurePleaseWaitOverlay() {
  let overlay = document.getElementById('spap-please-wait-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'spap-please-wait-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.4)', display: 'none',
      zIndex: '99999', alignItems: 'center',
      justifyContent: 'center', fontSize: '18px',
      color: '#fff', textAlign: 'center'
    });
    overlay.textContent = 'Please wait...';
    document.body.appendChild(overlay);
  }
  return overlay;
}
function addpleasewait() { _ensurePleaseWaitOverlay().style.display = 'flex'; }
function removepleasewait() {
  const o = document.getElementById('spap-please-wait-overlay');
  if (o) setTimeout(() => { o.style.display = 'none'; }, 2000);
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Standalone business-logic functions (reference the plugin via window)
// ─────────────────────────────────────────────────────────────────────────────

function searchworkorder() {
  // Rework Work Order form control: data-e2e="_e7fddd1a072a4f5baa7e102c2152e335-input"
  // (Same field used for both search and rework — the form's "Rework Work Order" textbox)
  const reworkInput = document.querySelector('[data-e2e="' + FORM_IDS.reworkWorkOrderInput + '"]');
  const rawWorkOrder = reworkInput ? reworkInput.value
    : (NWF$ ? NWF$('div[data-controlname="OriginalWorkOrder"] input').val() : '');
  const workOrderNo = (rawWorkOrder || '').toString().toUpperCase().replace(/ /g, '');
  console.log('searchworkorder:', workOrderNo);
  // Only load segment list here; getWorkOrderDetails is triggered after segment selection
  getWorkOrderSegmentsLoadMultiChoice(workOrderNo);
  return false;
}

function searchreworkorder() {
  // Read Rework Work Order from form control by data-e2e id (from HTML snapshot)
  const reworkInput = document.querySelector('[data-e2e="_e7fddd1a072a4f5baa7e102c2152e335-input"]');
  const rawWorkOrder = reworkInput ? reworkInput.value : '';
  const workOrderNo = (rawWorkOrder || '').toString().toUpperCase().replace(/ /g, '');
  console.log('searchreworkorder: workOrderNo =', workOrderNo);
  getWorkOrderSegments(workOrderNo, '_362dc540efb24c1b91eafc0f0a914c2c');
  return false;
}

function getWorkOrderSegmentsLoadMultiChoice(workOrderNo) {
  try {
    addpleasewait();

    const serviceUri = 'https://dummyjson.com/c/a17a-d2fd-44ae-b1fb';

    fetch(serviceUri)
      .then(res => res.json())
      .then(result => {

        // ❌ REMOVE this line completely in NAC
        // showSegmentsMultiSelects(result);

        // ✅ ONLY update the plugin UI
        if (window.serviceExpensePlugin) {
          window.serviceExpensePlugin.setSegments(result);
        }

      })
      .catch(err => console.error(err))
      .finally(() => removepleasewait());

  } catch (ex) {
    console.log(ex);
    removepleasewait();
  }
}

function getWorkOrderSegments(workOrderNo, segmentControlId) {
  try {
    addpleasewait();
    const serviceUri = 'https://dummyjson.com/c/a17a-d2fd-44ae-b1fb';
    console.log('getWorkOrderSegments', workOrderNo, segmentControlId);
    fetch(serviceUri, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(result => {
        console.log('Segments loaded:', result);
        // Push to plugin UI dropdown
        if (window.serviceExpensePlugin) window.serviceExpensePlugin.setSegments(result);
        else console.error('Plugin not ready');
      })
      .catch(err => { console.log(err); })
      .finally(() => { removepleasewait(); });
  } catch (ex) {
    console.log(ex.message);
    removepleasewait();
  }
  return false;
}

function getWorkOrderDetails(workOrderNo, Segmentvalue) {
  try {
    addpleasewait();
    const serviceUri = 'https://dummyjson.com/c/7a1a-0b52-4d60-afb0';
    console.log('getWorkOrderDetails', { workOrderNo, Segmentvalue, serviceUri });
    fetch(serviceUri, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(result => {
        const servicemenList = (result.Servicemen || []).map(s => `${s.EmpID} - ${s.Initial} ${s.Surname}`);
        if (window.serviceExpensePlugin) window.serviceExpensePlugin._renderServicemen(servicemenList);
        showWorkOrder(result);
      })
      .catch(err => { console.error('Failed to fetch work order details', serviceUri, err); })
      .finally(() => { removepleasewait(); });
  } catch (ex) {
    console.log(ex.message);
    removepleasewait();
  }
}

function showWorkOrder(result) {
  if (!window.serviceExpensePlugin) return;

  // ── RPO pattern: assign full object then dispatch once ──
  window.serviceExpensePlugin.jsonOut = {
    Branch: result.Branch || '',
    CustomerName: result.CustomerName || '',
    CustomerNumber: result.CustomerNumber || '',
    ModelNumber: result.ModelNumber || '',
    SerialNumber: result.SerialNumber || '',
    SMU: result.SMU || '',
    WorkOrderNo: result.WorkOrderNo || result.WorkOrder || '',
    RepairCost: result.RepairCost || '',
    RepairDescription: result.RepairDescription || ''
  };

  window.serviceExpensePlugin.dispatchEvent(new CustomEvent('ntx-value-change', {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: window.serviceExpensePlugin.jsonOut
  }));

  // ── Branch: set via ntx-list-lookup typeahead (auto-detects data-e2e) ──
  if (result.Branch) {
    // Try OriginalBranch wrapper first, then ReworkBranch as fallback
    var branchWrapper = document.querySelector('div[data-controlname="OriginalBranch"]')
      || document.querySelector('div[data-controlname="ReworkBranch"]');
    if (branchWrapper) {
      var branchE2eEl = branchWrapper.querySelector('[data-e2e]');
      var branchId = branchE2eEl ? branchE2eEl.getAttribute('data-e2e') : null;
      if (branchId) {
        setNtxListLookup(branchId, result.Branch);
      } else {
        console.warn('Branch data-e2e id not found in DOM');
      }
    }
  }

  // Work Location (standard NWF$ dropdown — not a list lookup)
  const WorkLocationVal = result.WorkLocation;
  if (WorkLocationVal) {
    const OrgworkLocation = NWF$('div[data-controlname="OriginalWorkLocation"] select')[0];
    if (NWF$(OrgworkLocation).val() != null) {
      NWF$(OrgworkLocation).find('option').each(function (index, element) {
        if (NWF$(element).text().toLowerCase() === WorkLocationVal.toLowerCase()) {
          NWF$(OrgworkLocation).val(index);
          NWF$(OrgworkLocation).parent().find('input').val(NWF$(element).attr('data-nfchoicevalue'));
          NWF$(OrgworkLocation).trigger('change');
        }
      });
    }
  }

  NWF$(NWF$('div[data-controlname="OriginalSMU"] input')[0]).val(result.SMU);
  NWF$(NWF$('div[data-controlname="CustomerNumber"] input')[0]).val(result.CustomerNumber);
  NWF$(NWF$('div[data-controlname="CustomerName"] input')[0]).val(result.CustomerName);
  NWF$(NWF$('div[data-controlname="MachineModel"] input')[0]).val(result.ModelNumber);
  NWF$(NWF$('div[data-controlname="SerialNumber"] input')[0]).val(result.SerialNumber);

  autoFillByIdMap(result);
}

function showReworkOrder(result) {
  // ── RPO pattern: assign full object then dispatch once ──
  if (window.serviceExpensePlugin) {
    window.serviceExpensePlugin.jsonOut = {
      Branch: result.Branch || '',
      CustomerName: result.CustomerName || '',
      CustomerNumber: result.CustomerNumber || '',
      ModelNumber: result.ModelNumber || '',
      SerialNumber: result.SerialNumber || '',
      SMU: result.SMU || '',
      WorkOrderNo: result.WorkOrderNo || result.WorkOrder || '',
      RepairCost: result.RepairCost || '',
      RepairDescription: result.RepairDescription || ''
    };

    window.serviceExpensePlugin.dispatchEvent(new CustomEvent('ntx-value-change', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: window.serviceExpensePlugin.jsonOut
    }));
  }

  // ── ReworkBranch: ntx-list-lookup async typeahead ──
  // Uses the data-e2e id confirmed from your HTML snapshot.
  if (result.Branch) {
    const reworkBranchId = getReworkBranchControlId();
    if (reworkBranchId) {
      setNtxListLookup(reworkBranchId, result.Branch);
    }
  }

  // ReworkWorkLocation (standard NWF$ dropdown — not a list lookup)
  const WorkLocationVal = result.WorkLocation;
  if (WorkLocationVal) {
    const OrgworkLocation = NWF$('div[data-controlname="ReworkLocation"] select')[0];
    if (NWF$(OrgworkLocation).val() != null) {
      NWF$(OrgworkLocation).find('option').each(function (index, element) {
        if (NWF$(element).text().toLowerCase() === WorkLocationVal.toLowerCase()) {
          NWF$(OrgworkLocation).val(index);
          NWF$(OrgworkLocation).parent().find('input').val(NWF$(element).attr('data-nfchoicevalue'));
          NWF$(OrgworkLocation).trigger('change');
        }
      });
    }
  }

  NWF$(NWF$('div[data-controlname="ReworkSMU"] input')[0]).val(result.SMU);
  NWF$(NWF$('div[data-controlname="ReworkRepairCost"] input')[0]).val(result.RepairCost);
  autoFillByIdMap(result);

  // ── Servicemen: interact via data-e2e on the ntx-multi-choice-checkbox group ──
  // Servicemen checkbox group wrapper: data-e2e="_17ad37eb601646c2baff704b4f8c5467"
  // Individual checkboxes:             data-e2e="get-_17ad37eb601646c2baff704b4f8c5467-{VALUE}"
  setServicemenCheckboxes(result.Servicemen || []);
}

function showSegmentsMultiSelects(result) {
  FillMultiSegments(result, 'StockDestroyedSegments');
  FillMultiSegments(result, 'SCSegments');
  FillMultiSegments(result, 'NQVSegments');
  FillMultiSegments(result, 'EGSegments');
}

function FillMultiSegments(resultSegments, sectionAndControlName) {
  if (!resultSegments || !resultSegments.length) {
    console.warn('FillMultiSegments: no segments returned for', sectionAndControlName);
    return;
  }
  NWF$(`.nf-${sectionAndControlName}ChoiceControl`).parent().html('');
  NWF$(`#${sectionAndControlName}cb`).html('');

  const checkbox_div = NWF$('<div>', { id: `${sectionAndControlName}cb` });
  let dbssmCount = 0;
  let textareaVal = '';

  NWF$.each(resultSegments, function (index, val) {
    dbssmCount++;
    const inputcb = NWF$('<input>', { type: 'checkbox', name: 'smcb', onclick: `handle_SegmentsCheckboxClick(this,"${sectionAndControlName}")`, value: val, text: val });
    checkbox_div.append(inputcb).append(val).append(NWF$('<br>'));
    textareaVal = textareaVal.length > 0 ? `${textareaVal},${val}:false` : `${val}:false`;
  });

  if (dbssmCount > 0) {
    let Servicemen_checkbox = NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`);
    while (Servicemen_checkbox.html().length) Servicemen_checkbox = Servicemen_checkbox.children();
    Servicemen_checkbox.append(checkbox_div);
    if (NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`).css('display') === 'none')
      NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`).show();
    NWF$(`div[data-controlname="${sectionAndControlName}"] textarea`).val(textareaVal);
  }
}

function DrawSegments(sectionAndControlName) {
  NWF$(`#${sectionAndControlName}cb`).html('');
  NWF$(`.nf-${sectionAndControlName}ChoiceControl`).parent().html('');
  const isDisplayMode = NWF$(location).attr('href').indexOf('mode=2') > -1;
  const existingVal = isDisplayMode
    ? NWF$(`div[data-controlname="${sectionAndControlName}"] input`).val()
    : NWF$(`div[data-controlname="${sectionAndControlName}"] textarea`).val();

  if (!existingVal || !existingVal.length) return;

  const entries = existingVal.split(',');
  const checkbox_div = NWF$('<div>', { id: `${sectionAndControlName}cb` });
  let smCount = 0;

  NWF$.each(entries, function (index, val) {
    const smDispName = val.split(':');
    const inputcb = smDispName[1] === 'true'
      ? NWF$('<input>', { type: 'checkbox', name: 'smcb', onclick: `handle_SegmentsCheckboxClick(this,"${sectionAndControlName}")`, value: smDispName[0], text: smDispName[0], checked: smDispName[1] })
      : NWF$('<input>', { type: 'checkbox', name: 'smcb', onclick: `handle_SegmentsCheckboxClick(this,"${sectionAndControlName}")`, value: smDispName[0], text: smDispName[0] });
    if (isDisplayMode) NWF$(inputcb).prop('disabled', true);
    checkbox_div.append(inputcb).append(smDispName[0]).append(NWF$('<br>'));
    smCount++;
  });

  if (smCount > 0) {
    let Servicemen_checkbox = NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`);
    while (Servicemen_checkbox.html().length) Servicemen_checkbox = Servicemen_checkbox.children();
    Servicemen_checkbox.append(checkbox_div);
    if (NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`).css('display') === 'none')
      NWF$(`div[data-controlname="${sectionAndControlName}Choice"]`).show();
  }
}

function handle_CheckboxClick(cb) {
  const ServicemenPicker = NWF$('div[data-controlname="Servicemen"] textarea');
  let value = NWF$(ServicemenPicker).val();
  NWF$.each(value.split(','), function (index, ele) {
    if (ele.split(':')[0].indexOf(cb.value) !== -1)
      value = value.replace(ele, `${cb.value}:${cb.checked}`);
  });
  NWF$(ServicemenPicker).val(value);
}

function handle_SegmentsCheckboxClick(cb, sectionAndControlName) {
  const ControlPicker = NWF$(`div[data-controlname="${sectionAndControlName}"] textarea`);
  let value = NWF$(ControlPicker).val();
  NWF$.each(value.split(','), function (index, ele) {
    if (ele.split(':')[0].indexOf(cb.value) !== -1)
      value = value.replace(ele, `${cb.value}:${cb.checked}`);
  });
  NWF$(ControlPicker).val(value);
}

function autoFillByIdMap(result) {
  if (!result || typeof result !== 'object') return;
  const idMap = {
    Branch: 'div[data-controlname="OriginalBranch"]',
    CustomerName: 'div[data-controlname="CustomerName"]',
    CustomerNumber: 'div[data-controlname="CustomerNumber"]',
    ModelNumber: 'div[data-controlname="MachineModel"]',
    SerialNumber: 'div[data-controlname="SerialNumber"]',
    SMU: 'div[data-controlname="OriginalSMU"]',
    WorkOrderNo: 'div[data-controlname="OriginalWorkOrder"]'
  };
  Object.keys(idMap).forEach(key => {
    if (result[key] !== undefined && result[key] !== null)
      setValueById(idMap[key], result[key]);
  });
}

function setValueById(selector, value) {
  const input = document.querySelector(`${selector} input`);
  const select = document.querySelector(`${selector} select`);
  const ngSelect = document.querySelector(`${selector} ng-select`);

  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (select) {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (ngSelect) {
    const option = ngSelect.querySelector(`.ng-option[title="${value}"]`);
    if (option) option.click();
    else console.warn('Option not found in ng-select:', value);
    return;
  }
  console.warn('No matching control found for:', selector);
}

/**
 * setNgSelectByControlId
 * ─────────────────────────────────────────────────────────────────────────────
 * Sets a Nintex ntx-list-lookup / ng-select field value by the control's
 * data-e2e id (e.g. "_ae4d178f29bc4e55b1694d080e2aa018").
 *
 * Strategy:
 *  1. Open the dropdown by focusing + typing the value into the search input
 *  2. Wait for ng-select to render matching options
 *  3. Click the first matching option
 *
 * Falls back to direct Angular component __ngContext__ select() call if available.
 */
/**
 * setNtxListLookup
 * ─────────────────────────────────────────────────────────────────────────────
 * Sets a Nintex ntx-list-lookup (ng-select typeahead) by its data-e2e control ID.
 *
 * The field uses an async typeahead — items are NOT pre-loaded in the DOM.
 * The correct approach is:
 *   1. Type the search text into the hidden input  → triggers the async load
 *   2. Wait for .ng-option elements to appear      → poll with retries
 *   3. Click the matching option                   → Angular registers the selection
 *
 * @param {string} controlId   data-e2e value, e.g. "_ae4d178f29bc4e55b1694d080e2aa018"
 * @param {string} searchText  text to type/search (what the API returns as branch name)
 * @param {number} [retries=8] how many 300ms ticks to wait for options to appear
 */
function setNtxListLookup(controlId, searchText, retries) {
  if (!searchText) return;
  retries = retries === undefined ? 8 : retries;

  const wrapper = document.querySelector('[data-e2e="' + controlId + '"]');
  if (!wrapper) {
    console.warn('setNtxListLookup: wrapper not found for', controlId);
    return;
  }

  const ngSelect = wrapper.querySelector('ng-select');
  if (!ngSelect) {
    console.warn('setNtxListLookup: ng-select not found inside', controlId);
    return;
  }

  const searchInput = ngSelect.querySelector('input[type="text"]');
  if (!searchInput) {
    console.warn('setNtxListLookup: search input not found inside ng-select for', controlId);
    return;
  }

  // Step 1: focus + type the search text to trigger async load
  searchInput.focus();
  searchInput.value = searchText;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  searchInput.dispatchEvent(new Event('keydown', { bubbles: true }));
  searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));

  console.log('setNtxListLookup: typed "' + searchText + '" into', controlId);

  // Step 2: poll for .ng-option items to appear, then click match
  let attempts = 0;
  const poll = setInterval(function () {
    attempts++;

    const options = wrapper.querySelectorAll('.ng-option');
    if (options.length > 0) {
      clearInterval(poll);

      // Find exact match (case-insensitive), fallback to first option
      let matched = null;
      options.forEach(function (opt) {
        const text = (opt.textContent || opt.innerText || '').trim();
        if (!matched && text.toLowerCase() === searchText.toLowerCase()) {
          matched = opt;
        }
      });

      const toClick = matched || options[0];
      toClick.click();
      console.log('setNtxListLookup: clicked option "' + (toClick.textContent || '').trim() + '" for', controlId);
      return;
    }

    // Strategy 2: try Angular __ngContext__ direct select()
    if (attempts === 3) {
      try {
        const ngCtx = ngSelect['__ngContext__'];
        if (ngCtx) {
          for (let i = 0; i < ngCtx.length; i++) {
            const ctx = ngCtx[i];
            if (ctx && typeof ctx.open === 'function' && typeof ctx.select === 'function' && ctx.itemsList) {
              ctx.open();
              const match = ctx.itemsList.items.find(function (item) {
                return (item.label || '').toLowerCase() === searchText.toLowerCase()
                  || (item.value || '').toLowerCase() === searchText.toLowerCase();
              });
              if (match) {
                ctx.select(match);
                console.log('setNtxListLookup: selected via Angular ctx "' + searchText + '"');
                clearInterval(poll);
                return;
              }
            }
          }
        }
      } catch (e) {
        console.warn('setNtxListLookup: Angular ctx strategy failed', e);
      }
    }

    if (attempts >= retries) {
      clearInterval(poll);
      console.warn('setNtxListLookup: gave up waiting for options for "' + searchText + '" in', controlId);
    }
  }, 300);
}

/**
 * getReworkBranchControlId
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns the data-e2e id for the ReworkBranch list lookup.
 * Hardcoded from your HTML snapshot; auto-detects as fallback.
 */
function getReworkBranchControlId() {
  // ── Hardcoded from your HTML: data-e2e="_ae4d178f29bc4e55b1694d080e2aa018" ──
  const HARDCODED_ID = '_ae4d178f29bc4e55b1694d080e2aa018';
  if (document.querySelector('[data-e2e="' + HARDCODED_ID + '"]')) {
    return HARDCODED_ID;
  }
  // Fallback: find ntx-list-lookup inside the ReworkBranch control wrapper
  const wrapper = document.querySelector('div[data-controlname="ReworkBranch"]');
  if (wrapper) {
    const el = wrapper.querySelector('[data-e2e]');
    if (el) return el.getAttribute('data-e2e');
  }
  console.warn('getReworkBranchControlId: could not find ReworkBranch control ID');
  return null;
}


function SaveAndContinueClientClick() { HideSegmentDropDown(); }
function SaveAndSubmitClientClick() { HideSegmentDropDown(); NWF$('#formFillerContainer').animate({ scrollTop: '0px' }, 300); }
function HideSegmentDropDown() {
  const reworksegdp = NWF$('div[data-controlname="reworksegdp"] select')[0];
  NWF$(reworksegdp).prop('disabled', 'disabled');
}

function ExecuteCode() {
  NWF$('.nf-saveCont-button input').click(function () { SaveAndContinueClientClick(); });

  const displayName = NWF$('div[data-controlname="UserProfileName"] label')[0].innerText;
  const branch = NWF$('div[data-controlname="UserProfileBranch"] label')[0].innerText;
  const department = NWF$('div[data-controlname="UserProfileDepartment"] label')[0].innerText;
  const managerAccount = NWF$('div[data-controlname="UserProfileManager"] label')[0].innerText;

  NWF$('div[data-controlname="UserProfileName"] label')[0].style.visibility = 'hidden';
  NWF$('div[data-controlname="UserProfileBranch"] label')[0].style.visibility = 'hidden';
  NWF$('div[data-controlname="UserProfileDepartment"] label')[0].style.visibility = 'hidden';
  NWF$('div[data-controlname="UserProfileManager"] label')[0].style.visibility = 'hidden';

  const managerEmail = managerAccount.replace('i:0#.f|membership|', '');
  const dispnameFld = NWF$('.dispname-control input:visible')[0];
  if (!NWF$(dispnameFld).val()) NWF$(dispnameFld).val(displayName);

  try {
    const branchDropDown = NWF$('.branch-control select')[0];
    if (NWF$(branchDropDown).val() === '') {
      NWF$(branchDropDown).find('option').each(function (index, element) {
        if (NWF$(element).text().indexOf(branch) > -1) {
          NWF$(branchDropDown).val(NWF$(element).val());
          NWF$(branchDropDown).parent().find('input').val(NWF$(element).attr('data-nfchoicevalue'));
          NWF$(branchDropDown).trigger('change');
        }
      });
    }
  } catch (err) { }

  try {
    const departmentDropDown = NWF$('.department-control select')[0];
    if (NWF$(departmentDropDown).val() === '') {
      NWF$(departmentDropDown).find('option').each(function (index, element) {
        if (NWF$(element).text().indexOf(department) > -1) {
          NWF$(departmentDropDown).val(NWF$(element).val());
          NWF$(departmentDropDown).parent().find('input').val(NWF$(element).attr('data-nfchoicevalue'));
          NWF$(departmentDropDown).trigger('change');
        }
      });
    }
  } catch (err) { }

  try {
    if (NWF$('.manager-control .ip-item > span > div').length === 0 && managerEmail.indexOf('@') > -1) {
      const getUserField = new NF.PeoplePickerWrapper('.manager-control input');
      getUserField.add({ value: managerEmail, label: managerEmail, type: 'user', email: managerEmail });
    }
  } catch (err) { }

  try {
    Date.prototype.toDDMMYYYYString = function () {
      return isNaN(this) ? 'NaN' : [
        this.getDate() > 9 ? this.getDate() : '0' + this.getDate(),
        this.getMonth() > 8 ? this.getMonth() + 1 : '' + (this.getMonth() + 1),
        this.getFullYear()
      ].join('/');
    };
    const Urdate = new Date().toDDMMYYYYString();
    if (NWF$(`#${UrReqdate}`).val() === '') NWF$(`#${UrReqdate}`).val(Urdate);
  } catch (err) { }

  if ((NWF$('div[data-controlname="ReworkSegment"] input').val() || '').toString().length > 0)
    NWF$('div[data-controlname="reworksegdp"]').hide();

  NWF$('div[data-controlname="reworksegdp"] select').change(function () {
    const ReworkSegmentvalue = NWF$('div[data-controlname="reworksegdp"] select').val();
    const rawReworkOrderNo = NWF$(NWF$('div[data-controlname="ReworkOrder"] input')[0]).val();
    const ReworkOrderNo = (rawReworkOrderNo || '').toString().toUpperCase().replace(/ /g, '');
    NWF$(NWF$('div[data-controlname="ReworkSegment"] input')[0]).val(ReworkSegmentvalue);
    if (typeof getReworkOrderDetails === 'function') getReworkOrderDetails(ReworkOrderNo, ReworkSegmentvalue);
  });

  NWF$('#servicemencb').html('');
  NWF$('.nf-serviceMenChoiceControl').parent().html('');
  const isDisplayMode = NWF$(location).attr('href').indexOf('mode=2') > -1;
  const existingVal = isDisplayMode
    ? NWF$('div[data-controlname="Servicemen"] input').val()
    : NWF$('div[data-controlname="Servicemen"] textarea').val();

  if (existingVal && existingVal.length > 0) {
    const entries = existingVal.split(',');
    const checkbox_div = NWF$('<div>', { id: 'servicemencb' });
    let smCount = 0;

    NWF$.each(entries, function (index, val) {
      const smDispName = val.split(':');
      const inputcb = smDispName[1] === 'true'
        ? NWF$('<input>', { type: 'checkbox', name: 'smcb', onclick: 'handle_CheckboxClick(this)', value: smDispName[0], text: smDispName[0], checked: smDispName[1] })
        : NWF$('<input>', { type: 'checkbox', name: 'smcb', onclick: 'handle_CheckboxClick(this)', value: smDispName[0], text: smDispName[0] });
      if (isDisplayMode) NWF$(inputcb).prop('disabled', true);
      checkbox_div.append(inputcb).append(smDispName[0]).append(NWF$('<br>'));
      smCount++;
    });

    if (smCount > 0) {
      let Servicemen_checkbox = NWF$('div[data-controlname="servicemenchoice"]');
      while (Servicemen_checkbox.html().length) Servicemen_checkbox = Servicemen_checkbox.children();
      Servicemen_checkbox.append(checkbox_div);
      if (NWF$('div[data-controlname="servicemenchoice"]').css('display') === 'none')
        NWF$('div[data-controlname="servicemenchoice"]').show();
    }
  }

  DrawSegments('StockDestroyedSegments');
  DrawSegments('SCSegments');
  DrawSegments('NQVSegments');
  DrawSegments('EGSegments');
}

// ─────────────────────────────────────────────────────────────────────────────
// Form control helpers — interact with Nintex form controls via data-e2e IDs
// Extracted from your HTML:
//   Rework Work Order input : [data-e2e="_e7fddd1a072a4f5baa7e102c2152e335-input"]
//   Search button           : [data-e2e="_4a1e7267c83444a29574ef4f531b6718-btn"]
//   Segment ng-select       : [data-e2e="_362dc540efb24c1b91eafc0f0a914c2c-select"]
//   Servicemen multi-choice : [data-e2e="_17ad37eb601646c2baff704b4f8c5467"]
// ─────────────────────────────────────────────────────────────────────────────

// IDs extracted from your form HTML — change here if controls are rebuilt
const FORM_IDS = {
  reworkWorkOrderInput: '_e7fddd1a072a4f5baa7e102c2152e335-input',
  searchButton: '_4a1e7267c83444a29574ef4f531b6718-btn',
  segmentSelect: '_362dc540efb24c1b91eafc0f0a914c2c-select',
  servicemenGroup: '_17ad37eb601646c2baff704b4f8c5467'
};

/**
 * setFormTextInput
 * Sets a plain Nintex text input value by its data-e2e id and fires
 * input + change so Angular/Nintex picks up the new value.
 */
function setFormTextInput(e2eId, value) {
  const el = document.querySelector('[data-e2e="' + e2eId + '"]');
  if (!el) { console.warn('setFormTextInput: not found', e2eId); return; }
  el.value = value || '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
  console.log('setFormTextInput:', e2eId, '=', value);
}

/**
 * clickFormButton
 * Clicks a Nintex button by its data-e2e id.
 */
function clickFormButton(e2eId) {
  const btn = document.querySelector('[data-e2e="' + e2eId + '"]');
  if (!btn) { console.warn('clickFormButton: not found', e2eId); return; }
  btn.click();
  console.log('clickFormButton:', e2eId);
}

/**
 * setFormNgSelect
 * Sets a Nintex ntx-simple-select-single (ng-select) value by its data-e2e id.
 * The wrapper data-e2e points to ntx-simple-select-single; we find
 * the inner ng-select and use the Angular __ngContext__ to call select(),
 * with a DOM-click fallback.
 *
 * @param {string} e2eId     data-e2e of the ntx-simple-select-single wrapper
 * @param {string} value     the option VALUE to select (bindvalue="value")
 */
function setFormNgSelect(e2eId, value) {
  if (!value) return;

  const wrapper = document.querySelector('[data-e2e="' + e2eId + '"]');
  if (!wrapper) { console.warn('setFormNgSelect: wrapper not found', e2eId); return; }

  const ngSelect = wrapper.querySelector('ng-select') || wrapper.closest('ng-select') || wrapper;
  if (!ngSelect) { console.warn('setFormNgSelect: ng-select not found inside', e2eId); return; }

  // ── Strategy 1: Angular __ngContext__ direct select() ──
  try {
    const ctx = ngSelect['__ngContext__'];
    if (ctx) {
      for (let i = 0; i < ctx.length; i++) {
        const comp = ctx[i];
        if (comp && typeof comp.open === 'function' && typeof comp.select === 'function' && comp.itemsList) {
          // Items may not be loaded yet — open first, then poll
          comp.open();
          let tries = 0;
          const waitForItems = setInterval(function () {
            tries++;
            const items = comp.itemsList ? comp.itemsList.items : [];
            const match = items.find(function (item) {
              return String(item.value || '').toLowerCase() === String(value).toLowerCase()
                || String(item.label || '').toLowerCase() === String(value).toLowerCase();
            });
            if (match) {
              comp.select(match);
              clearInterval(waitForItems);
              console.log('setFormNgSelect: selected via Angular ctx "' + value + '" in', e2eId);
              return;
            }
            if (tries >= 8) {
              clearInterval(waitForItems);
              console.warn('setFormNgSelect: Angular ctx — no match for "' + value + '" in', e2eId);
              _ngSelectClickFallback(ngSelect, value);
            }
          }, 300);
          return;
        }
      }
    }
  } catch (e) {
    console.warn('setFormNgSelect: Angular ctx failed', e);
  }

  // ── Strategy 2: type into input → wait for options → click ──
  _ngSelectClickFallback(ngSelect, value);
}

function _ngSelectClickFallback(ngSelect, value) {
  const input = ngSelect.querySelector('input[type="text"]');
  if (!input) { console.warn('_ngSelectClickFallback: no input found'); return; }

  input.focus();
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('keydown', { bubbles: true }));
  input.dispatchEvent(new Event('keyup', { bubbles: true }));

  let tries = 0;
  const poll = setInterval(function () {
    tries++;
    // Options are rendered in the dropdown panel (may be outside shadow DOM)
    const panel = document.querySelector('.ng-dropdown-panel');
    const options = panel ? panel.querySelectorAll('.ng-option') : [];

    if (options.length > 0) {
      clearInterval(poll);
      let matched = null;
      options.forEach(function (opt) {
        const text = (opt.textContent || '').trim();
        if (!matched && text.toLowerCase() === value.toLowerCase()) matched = opt;
      });
      const toClick = matched || options[0];
      toClick.click();
      console.log('_ngSelectClickFallback: clicked "' + (toClick.textContent || '').trim() + '"');
      return;
    }
    if (tries >= 10) {
      clearInterval(poll);
      console.warn('_ngSelectClickFallback: gave up waiting for options for "' + value + '"');
    }
  }, 300);
}

/**
 * setFormServicemen
 * Populates the Nintex multi-choice checkbox group for Servicemen.
 * The existing "NA" option is always present in the form; additional
 * options are injected as new checkbox items into the ng-checkbox-group.
 *
 * @param {string[]} servicemenList  e.g. ["E001 - J Smith", "E002 - R Jones"]
 */
function setFormServicemen(servicemenList) {
  const groupEl = document.querySelector('[data-e2e="' + FORM_IDS.servicemenGroup + '"]');
  if (!groupEl) { console.warn('setFormServicemen: servicemen group not found'); return; }

  const checkboxGroup = groupEl.querySelector('.nx-checkbox-group');
  if (!checkboxGroup) { console.warn('setFormServicemen: .nx-checkbox-group not found'); return; }

  // Remove any previously injected dynamic checkboxes (keep original NA)
  checkboxGroup.querySelectorAll('.nx-checkbox.injected').forEach(function (el) { el.remove(); });

  if (!servicemenList || !servicemenList.length) return;

  servicemenList.forEach(function (smName) {
    const safeId = smName.replace(/[^a-zA-Z0-9]/g, '_');

    const wrapper = document.createElement('div');
    wrapper.className = 'nx-checkbox injected';

    const label = document.createElement('label');
    label.setAttribute('data-e2e', 'set-sm-' + safeId);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = FORM_IDS.servicemenGroup;
    input.value = smName;
    input.id = 'sm_' + safeId;
    input.setAttribute('data-fillin', 'false');
    input.setAttribute('data-e2e', 'get-sm-' + safeId);

    // When checked, update the Nintex hidden textarea (same as handle_CheckboxClick)
    input.addEventListener('change', function () {
      handle_CheckboxClick(input);
    });

    const faux = document.createElement('span');
    faux.className = 'nx-checkbox-faux';

    const labelText = document.createElement('span');
    labelText.className = 'nx-checkbox-label';
    labelText.textContent = smName;

    label.appendChild(input);
    label.appendChild(faux);
    label.appendChild(labelText);
    wrapper.appendChild(label);

    checkboxGroup.appendChild(wrapper);
  });

  console.log('setFormServicemen: injected', servicemenList.length, 'servicemen');
}

// ─────────────────────────────────────────────────────────────────────────────
// NAC LitElement Plugin
// ─────────────────────────────────────────────────────────────────────────────
export class ServiceExpenseApprovalPlugin extends LitElement {

  static properties = {
    workOrder: { type: String },
    jsonOut: { type: Object },
    segments: { type: Array },
    selectedSegment: { type: String }   // 
  };

  constructor() {
    super();
    this.workOrder = '';
    this.jsonOut = null;

    this.segments = [];
    this.selectedSegment = '';


  }

  // ── Meta config ────────────────────────────────────────────────────────────
  static getMetaConfig() {
    return {
      controlName: 'Service Expense Search Plugin',
      version: '1.0',
      description: 'Work order search with segment and servicemen support',
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
        workOrder: {
          type: 'string',
          title: 'Work Order',
          description: 'Enter the work order number'
        },
        jsonOut: {
          type: 'object',
          title: 'Service Expense Search Data',
          isValueField: true,
          properties: {
            Branch: { type: 'string', title: 'Branch', description: 'Branch' },
            CustomerName: { type: 'string', title: 'CustomerName', description: 'CustomerName' },
            CustomerNumber: { type: 'string', title: 'CustomerNumber', description: 'CustomerNumber' },
            ModelNumber: { type: 'string', title: 'ModelNumber', description: 'ModelNumber' },
            RepairCost: { type: 'string', title: 'RepairCost', description: 'RepairCost' },
            RepairDescription: { type: 'string', title: 'RepairDescription', description: 'RepairDescription' },
            SerialNumber: { type: 'string', title: 'SerialNumber', description: 'SerialNumber' },
            SMU: { type: 'string', title: 'SMU', description: 'SMU' },
            WorkOrderNo: { type: 'string', title: 'WorkOrderNo', description: 'WorkOrderNo' }
          }
        }
      },
      events: ['ntx-value-change']
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  connectedCallback() {
    super.connectedCallback();
    window.serviceExpensePlugin = this;

    // Wire up form controls once the DOM is ready
    // Use a short delay to ensure Nintex has rendered the form controls
    setTimeout(() => { this._wireFormControls(); }, 800);
  }

  /**
   * _wireFormControls
   * Attaches event listeners to the actual Nintex form controls
   * using the data-e2e IDs extracted from the HTML snapshot.
   *
   * Controls wired:
   *  1. Search button  → calls searchworkorder() (reads work order from form input)
   *  2. Segment ng-select → on selection, calls getWorkOrderDetails
   */
  _wireFormControls() {
    // ── 1. Search button ──────────────────────────────────────────────────────
    const searchBtn = document.querySelector('[data-e2e="' + FORM_IDS.searchButton + '"]');
    if (searchBtn) {
      if (!searchBtn._pluginWired) {
        searchBtn._pluginWired = true;

        searchBtn.addEventListener('click', () => {
          const reworkInput = document.querySelector(
            '[data-e2e="' + FORM_IDS.reworkWorkOrderInput + '"]'
          );

          this.workOrder = (reworkInput?.value || '')
            .toUpperCase()
            .replace(/ /g, '');

          console.log('Plugin stored workOrder:', this.workOrder);

          searchworkorder();
        });

      }
    } else {
      console.warn('_wireFormControls: Search button not found', FORM_IDS.searchButton);
    }

    // ── 2. Segment ng-select ──────────────────────────────────────────────────
    // The segment control is ntx-simple-select-single → contains ng-select
    // We listen on the outer wrapper for 'change' (Angular emits it on selection)
    const segWrapper = document.querySelector('[data-e2e="' + FORM_IDS.segmentSelect + '"]');
    if (segWrapper) {
      if (!segWrapper._pluginWired) {
        segWrapper._pluginWired = true;

        // Angular ng-select fires a native 'change' event on the host element
        // segWrapper.addEventListener('change', (e) => {
        //   const selectedValue = e.detail || e.target.value || '';
        //   if (!selectedValue) return;
        //   console.log('Plugin: Segment selected', selectedValue);

        //   // Get current work order from the form input
        //   const reworkInput = document.querySelector('[data-e2e="' + FORM_IDS.reworkWorkOrderInput + '"]');
        //   const workOrderNo = ((reworkInput ? reworkInput.value : '') || '').toUpperCase().replace(/ /g, '');

        //   // Sync to legacy NWF$ controls if still present
        //   if (NWF$) {
        //     NWF$('div[data-controlname="OriginalSegment"] input').val(selectedValue).trigger('change');
        //     NWF$('div[data-controlname="ReworkSegment"] input').val(selectedValue).trigger('change');
        //   }

        //   if (workOrderNo) {
        //     if (typeof getWorkOrderDetails === 'function') getWorkOrderDetails(workOrderNo, selectedValue);
        //   }
        // });

        // Also intercept via Angular __ngContext__ ntx-value-change if available
        // segWrapper.addEventListener('ntx-value-change', (e) => {
        //   const selectedValue = e.detail && e.detail.value ? e.detail.value : (e.detail || '');
        //   if (!selectedValue) return;
        //   console.log('Plugin: Segment ntx-value-change', selectedValue);

        //   const reworkInput = document.querySelector('[data-e2e="' + FORM_IDS.reworkWorkOrderInput + '"]');
        //   const workOrderNo = ((reworkInput ? reworkInput.value : '') || '').toUpperCase().replace(/ /g, '');
        //   if (workOrderNo) {
        //     if (typeof getWorkOrderDetails === 'function') getWorkOrderDetails(workOrderNo, selectedValue);
        //   }
        // });

        console.log('Plugin: wired Segment ng-select');
      }
    } else {
      console.warn('_wireFormControls: Segment control not found', FORM_IDS.segmentSelect);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (window.serviceExpensePlugin === this) delete window.serviceExpensePlugin;
  }

  // ── Public API (called by standalone functions) ────────────────────────────

  /**
   * Called by getWorkOrderSegments() after API responds.
   * Populates the Nintex Segment ng-select with the returned options.
   */

  // _onSegmentChange(event) {
  //   const selectedValue = event.target.value;

  //   if (!selectedValue) return;

  //   this.selectedSegment = selectedValue;

  //   if (!this.workOrder) {
  //     console.warn('Segment selected but workOrder is missing');
  //     return;
  //   }

  //   console.log(
  //     'Segment selected → calling getWorkOrderDetails',
  //     this.workOrder,
  //     selectedValue
  //   );

  //   if (typeof getWorkOrderDetails === 'function') {
  //     getWorkOrderDetails(this.workOrder, selectedValue);
  //   } else {
  //     console.warn('getWorkOrderDetails is not defined');
  //   }
  // }

  _handleSegmentChange(e) {
    const selectedValue = e.target.value;

    console.log('Segment change triggered:', selectedValue);

    if (!selectedValue) return;

    this.selectedSegment = selectedValue;

    if (!this.workOrder) {
      console.warn('Segment selected but workOrder is empty');
      return;
    }

    console.log(
      'Calling getWorkOrderDetails with:',
      this.workOrder,
      selectedValue
    );

    if (typeof getWorkOrderDetails === 'function') {
      getWorkOrderDetails(this.workOrder, selectedValue);
    }
  }

  // _handleSegmentChange(e) {
  //   const selectedValue = e.target.value;
  //   this.selectedSegment = selectedValue;
  //   if (!selectedValue) return;

  //   // Sync to Nintex controls
  //   const control = NWF$('div[data-controlname="reworksegdp"] input');
  //   if (control.length) { control.val(selectedValue); control.trigger('change'); }
  //   NWF$('div[data-controlname="OriginalSegment"] input').val(selectedValue).trigger('change');
  //   NWF$('div[data-controlname="ReworkSegment"] input').val(selectedValue).trigger('change');

  //   const workOrderNo = (this.workOrder
  //     || NWF$('div[data-controlname="OriginalWorkOrder"] input').val()
  //     || NWF$('div[data-controlname="ReworkOrder"] input').val()
  //     || '').toString().toUpperCase().replace(/ /g, '');

  //   if (workOrderNo) {
  //     if (typeof getWorkOrderDetails === 'function') getWorkOrderDetails(workOrderNo, selectedValue);
  //     if (typeof getReworkOrderDetails === 'function') getReworkOrderDetails(workOrderNo, selectedValue);
  //   }
  //   console.log('Selected Segment:', selectedValue);
  // }


  setSegments(data) {
    console.log('Plugin setSegments:', data);

    // Normalize API response
    this.segments = Array.isArray(data) ? data : [];

    // ✅ IMPORTANT: do NOT auto-select any segment
    // Force user selection so @change always fires
    this.selectedSegment = '';

    // 🔥 Ensure Lit re-renders the dropdown
    this.requestUpdate();
  }

  // setSegments(data) {
  //   console.log('Plugin setSegments:', data);
  //   const segments = Array.isArray(data) ? data : [];

  //   // Update local plugin dropdown state
  //   this.segments = segments;
  //   this.selectedSegment = segments.length > 0 ? segments[0] : '';

  //   // Sync selected value with any existing segment controls
  //   if (NWF$ && this.selectedSegment) {
  //     NWF$('div[data-controlname="OriginalSegment"] input').val(this.selectedSegment).trigger('change');
  //     NWF$('div[data-controlname="ReworkSegment"] input').val(this.selectedSegment).trigger('change');
  //   }

  //   // Populate the Nintex Segment control via its data-e2e id
  //   // The segment control is ntx-simple-select-single — we inject options
  //   // into the ng-select Angular component
  //   const wrapper = document.querySelector('[data-e2e="' + FORM_IDS.segmentSelect + '"]');
  //   if (!wrapper) { console.warn('setSegments: segment wrapper not found'); return; }

  //   const ngSelect = wrapper.querySelector('ng-select') || wrapper;
  //   try {
  //     const ctx = ngSelect['__ngContext__'];
  //     if (ctx) {
  //       for (let i = 0; i < ctx.length; i++) {
  //         const comp = ctx[i];
  //         if (comp && comp.itemsList && typeof comp.writeValue === 'function') {
  //           const items = segments.map(function (s) { return { text: s, value: s }; });
  //           comp.items = items;
  //           if (typeof comp.detectChanges === 'function') comp.detectChanges();
  //           console.log('setSegments: loaded', items.length, 'items into Segment ng-select');
  //           return;
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     console.warn('setSegments: Angular ctx failed', e);
  //   }
  //   console.warn('setSegments: could not inject items — ng-select component not found');
  // }

  /**
   * Called by getWorkOrderDetails() after API responds.
   * Populates the Nintex Servicemen multi-choice checkbox group.
   */
  _renderServicemen(list) {
    console.log('Plugin _renderServicemen:', list);
    setFormServicemen(Array.isArray(list) ? list : []);
  }

  // ── Render — segment dropdown + plugin update ──
  static styles = css`
    :host { display: block; margin: 16px 0; }
    .segment-wrapper { display: flex; flex-direction: column; gap: 4px; width: 100%; max-width: 640px; }
    .segment-label { font-weight: 600; font-size: 14px; color: #111; }
    .segment-label .required { color: #d03838; margin-left: 3px; }
    .segment-select { width: 100%; min-width: 0; padding: 10px 12px; font-size: 15px; line-height: 1.4; border: 1px solid #c0c4c8; border-radius: 5px; background-color: #fff; color: #111; cursor: pointer; font-family: inherit; box-sizing: border-box; }
    .segment-select:hover { border-color: #999; }
    .segment-select:focus { outline: none; border-color: #0078d4; box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2); }
  `;



  render() {
    return html`
    <div class="segment-wrapper">
      <label class="segment-label">
        Segment <span class="required">*</span>
      </label>

      <select
        class="segment-select"
        .value=${this.selectedSegment}
        @change=${this._handleSegmentChange}
      >
        <option value="">Please Select</option>
        ${this.segments.map(
      seg => html`<option value=${seg}>${seg}</option>`
    )}
      </select>
    </div>
  `;
  }

}

customElements.define('service-expense-approval-plugin', ServiceExpenseApprovalPlugin);

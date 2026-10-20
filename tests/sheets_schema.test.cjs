const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'google_apps_script.gs'), 'utf8'), context);
const plain = value => JSON.parse(JSON.stringify(value));
const sheets = new Map();
context.appendRows = (name, rows, headers) => {
  assert.equal(new Set(headers).size, headers.length, `${name}: duplicate headers`);
  rows.forEach(row => Object.keys(row).forEach(key => assert(headers.includes(key), `${name}: missing header ${key}`)));
  sheets.set(name, { rows: plain(rows), headers: plain(headers) });
};

const params = context.normalizeSubmission({
  surveySchemaVersion: ['2026-10-20.2'],
  luckyDrawUpi: ['testparticipant@okaxis'],
  choiceDesignVersion: ['test-design'], choiceBlock: ['random:test'],
  dhamCurrentVisit: ['Kedarnath; Badrinath; Hemkund Sahib'],
  challenge: ['Shared Path With Ponies; Poor Cleanliness'],
  primaryHelicopterCoveredDhams_Kedarnath_route: ['Kedarnath; Badrinath'],
  dhamSequence_1: ['Kedarnath'], dhamSequence_2: ['Badrinath'],
  ongoingDhamStatus_Badrinath: ['Planned next'],
  railGate: ['yes'], railNoReason: ['extra_transfers', 'luggage_difficulty'],
  railLuggageTransfer: ['4'], railFewerChangesPreference: ['5'],
  ropewayHeightConcern: ['2'], ropewayWaitUncertainty: ['4'], ropewayTimePreference: ['5'],
  ropewayEffortPreference: ['4'], ropewayWalkingCostPreference: ['3'],
  wtpRopewayShrine: ['Hemkund Sahib'], transportBudgetBasis: ['Group total'], transportBudgetGroup: ['Rs 25000-50000'],
  primaryDham_Kedarnath_route: ['Kedarnath'], primaryTravelStatus_Kedarnath_route: ['Known'],
  primaryMode_Kedarnath_route: ['Tour/Group Bus'], primaryFareBasis_Kedarnath_route: ['Group total'],
  mainHaulTransferLocation_Kedarnath_1: ['Rudraprayag'],
  mainHaulTransferTimeRange_Kedarnath_1: ['1–2 hr'], mainHaulTransferCostRange_Kedarnath_1: ['Below ₹250'],
  interDhamFrom_Kedarnath__Badrinath: ['Sonprayag'], interDhamTo_Kedarnath__Badrinath: ['Badrinath'],
  interDhamTravelStatus_Kedarnath__Badrinath: ['Not completed yet / mode not decided'],
  interDhamMode_Kedarnath__Badrinath: ['Not completed yet / mode not decided'],
  interDhamTransferLocation_Kedarnath__Badrinath_1: ['Rudraprayag'],
  interDhamTransferTimeRange_Kedarnath__Badrinath_1: ['1–2 hr'],
  interDhamTransferCostRange_Kedarnath__Badrinath_1: ['Below ₹500'],
  'returnRoute[]': ['Badrinath to Rishikesh'], 'returnDham[]': ['Badrinath'],
  returnMode_0: ['Bus/MiniBus'], returnTimeRange_0: ['8–10 hr'], returnCostRange_0: ['Below ₹500'],
  restRoute_0: ['Route to Badrinath'], restBookingStatus_0: ['Prebooked by tour operator'],
  restDurationChoice_0: ['12–24 hr'], restAccom_0: ['Dormitory'], restCostChoice_0: ['₹0–₹500'],
  stayBookingStatus_Badrinath: ['Not booked'],
  stayAccom_Kedarnath: ['Same day return (no overnight stay)'],
  stayAccomCost_Kedarnath: ['0'], stayAccomCostRange_Kedarnath: ['No cost (₹0)'],
  stayAccomCostBasis_Kedarnath: ['Whole travelling group'],
  lastMileTimeBand_Kedarnath: ['6–9 hr'], lastMileCostBand_Kedarnath: ['No cost (₹0)'],
  lastMileApproachWaitingRange_HemkundSahib: ['15–20'],
  lastMileReturnTimeBand_Kedarnath_Leg2: ['Under 15 min'],
  lastMileReturnCostBand_Kedarnath_Leg2: ['No cost (₹0)'],
  main_haul_Kedarnath_Task7: ['C: Railway + Feeder Bus'],
  last_mile_HemkundSahib_Task3: ['C: Ropeway'],
});
assert.deepEqual(plain(context.selectedDhams(params)), ['Kedarnath', 'Badrinath', 'Hemkund Sahib']);
assert.deepEqual(plain(params.challenge), ['Shared Path With Ponies', 'Poor Cleanliness']);
assert.deepEqual(plain(params.primaryHelicopterCoveredDhams_Kedarnath_route), ['Kedarnath', 'Badrinath']);
assert.deepEqual(plain(context.normalizeSubmission({dhamCurrentVisit: ['Kedarnath', 'Badrinath']}).dhamCurrentVisit), ['Kedarnath', 'Badrinath']);

const id = 'TEST_ONLY';
context.writeRespondent(params, id, new Date());
assert.equal(sheets.get('Respondents').rows[0].luckyDrawUpi, 'testparticipant@okaxis');
context.writeDhamVisits(params, id);
context.writeMainHaulSegments(params, id);
context.writeMainHaulTransfers(params, id);
context.writeInterDhamSegments(params, id);
context.writeReturnSegments(params, id);
context.writeStopovers(params, id);
context.writeLastMileTrips(params, id);
context.writeServiceEvaluations(params, id);
context.writeChoiceResponses(params, id);
context.writeResponseFields(params, id);
const row = name => sheets.get(name).rows[0];
assert.equal(sheets.get('DhamVisits').rows.length, 3);
assert.equal(row('Respondents').railFewerChangesPreference, '5');
assert.equal(row('Respondents').ropewayEffortPreference, '4');
assert.equal(row('Respondents').wtpRopewayShrine, 'Hemkund Sahib');
assert.equal(row('Respondents').transportBudgetGroup, 'Rs 25000-50000');
assert.equal(row('MainHaulSegments').travelStatus, 'Known');
assert.equal(row('MainHaulSegments').helicopterCoveredDhams, 'Kedarnath, Badrinath');
assert.equal(row('MainHaulTransfers').timeRange, '1–2 hr');
assert.equal(row('InterDhamSegments').travelStatus, 'Not completed yet / mode not decided');
assert.equal(row('InterDhamSegments').cost, '', 'Skipped fare must remain blank, not zero');
assert.equal(row('InterDhamTransfers').timeRange, '1–2 hr');
assert.equal(row('InterDhamTransfers').costRange, 'Below ₹500');
assert.equal(row('ReturnSegments').timeRange, '8–10 hr');
assert.equal(row('ReturnSegments').costRange, 'Below ₹500');
assert.equal(row('Stopovers').bookingStatus, 'Prebooked by tour operator');
assert.equal(row('Stopovers').durationRange, '12–24 hr');
assert.equal(row('Stopovers').costRange, '₹0–₹500');
assert.equal(row('Stopovers').cost, '', 'A cost range must not become a fabricated exact amount');
assert.equal(row('DhamVisits').stayAccommodationCost, '0');
assert.equal(row('DhamVisits').stayAccommodationCostRange, 'No cost (₹0)');
assert.equal(sheets.get('DhamVisits').rows[1].stayBookingStatus, 'Not booked');
assert.equal(sheets.get('LastMileTrips').rows[2].approachWaitingRange, '15–20');
assert.equal(row('LastMileTrips').timeBand, '6–9 hr');
assert.equal(row('LastMileTrips').returnLeg2TimeBand, 'Under 15 min');
assert.equal(row('ChoiceResponses').task, 7, 'Use the CSV task ID, not the displayed card position');
assert.equal(row('ChoiceResponses').chosenOptionCode, 'C');
assert.equal(row('ChoiceResponses').choiceDesignVersion, 'test-design');
assert.equal(sheets.get('ChoiceResponses').rows[1].dham, 'Hemkund Sahib');
for (const [field, values] of Object.entries(params)) {
  values.forEach(value => assert(sheets.get('ResponseFields').rows.some(r => r.fieldName === field && r.fieldValue === value), `Raw omission: ${field}`));
  assert(context.orderedRawKeys(params).includes(field), `Ordered raw omission: ${field}`);
}

// Header expansion must keep existing values under their original column names.
let data = [['responseId', 'legacy'], ['OLD', 'preserve me']];
const sheet = {
  getLastRow: () => data.length,
  getLastColumn: () => Math.max(...data.map(r => r.length)),
  getRange: (row, col, height, width) => ({
    getValues: () => Array.from({length: height}, (_, r) => Array.from({length: width}, (_, c) => data[row-1+r]?.[col-1+c] ?? '')),
    setValues: values => values.forEach((valuesRow, r) => valuesRow.forEach((v, c) => {
      data[row-1+r] ??= [];
      data[row-1+r][col-1+c] = v;
    })),
  }),
  getDataRange: () => ({ clearContent: () => { data = []; } }),
  setFrozenRows: () => {},
};
context.ensureHeaders(sheet, ['responseId', 'newQuestion']);
assert.deepEqual(plain(data), [['responseId', 'newQuestion', 'legacy'], ['OLD', '', 'preserve me']]);
context.ensureHeaders(sheet, ['newQuestion', 'responseId']);
assert.deepEqual(plain(data), [['newQuestion', 'responseId', 'legacy'], ['', 'OLD', 'preserve me']]);
console.log('PASS: repeated checkboxes, new attitudes/options, structured headers, range vs exact values, skipped vs zero costs, task IDs, raw coverage and legacy header preservation. No live spreadsheet writes.');

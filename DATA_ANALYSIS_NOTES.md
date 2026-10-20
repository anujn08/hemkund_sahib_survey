# Survey data and Google Sheets audit

Audited: 20 October 2026. Client schema: `2026-10-20.1`. Apps Script version: `2.3`.

## Update the deployed script

Local changes do not update the copy you already pasted into Google Apps Script.

1. Replace `Code.gs` with the complete contents of `google_apps_script.gs` and save.
2. Select **Deploy → Manage deployments**, edit the existing web-app deployment, select **New version**, and deploy.
3. Keep the existing deployment URL so the survey continues posting to the same endpoint. Publish the updated `index.html` and `script.js` together as well.
4. Open the web-app `/exec` URL in a browser. Its JSON response should report `version: "2.3"`. This checks the deployed code version; it does not prove a submission was written successfully.
5. Before collecting real responses, submit a clearly identified test response and verify it in the destination spreadsheet. Check several selected shrines and a planned-next shrine, not just a single-shrine response.

Google deployment instructions: https://developers.google.com/apps-script/concepts/deployments

## Which sheets to use

Every sheet has `responseId`, which links the tables. Each submission creates a new ID.

| Sheet | Contents |
|---|---|
| `Sheet1` | All submitted fields, with dynamically added column headers. |
| `RawOrdered` | All submitted fields arranged in topic order; additional fields are retained. |
| `ResponseFields` | One row per submitted field/value. Repeated checkbox values have separate rows and `valueIndex`. This is the most direct place to check what reached the server. |
| `Respondents` | One row per response: demographics, trip information, attitude scores, priorities, feedback, schema versions and choice-design fingerprint. |
| `DhamVisits` | One row per selected shrine, including visit order, trip progress, stay booking status and accommodation cost range/basis. |
| `MainHaulSegments` | First/main travel route, travel status, selected mode, time/cost codes and range labels, fare basis, occupancy and helicopter details. |
| `MainHaulTransfers` | Vehicle-change locations and subsequent travel details, including time/cost range labels. |
| `InterDhamSegments` / `InterDhamTransfers` | Travel between shrines, including pending/known status and time/cost ranges. |
| `ReturnSegments` | Return journey details, including fare basis and time/cost ranges. |
| `Stopovers` | Route, prebooking status, place/facility, duration range or exact hours, cost range or exact cost. |
| `LastMileTrips` | Travel to/from each shrine, time/cost bands, approach waiting ranges, Hemkund travel stages and stay information. |
| `ServiceEvaluations` | Service ratings when present. |
| `ChoiceResponses` | Experiment, shrine, original CSV task ID, selected alternative code/label, choice block and choice-design fingerprint. |

Headers expand by name, and existing rows are remapped by their original header names. Do not rely on column letters or column position. Removed question columns are retained for historical data.

## Current attitude statements

All of these use **1 = strongly disagree, 2 = disagree, 3 = neutral, 4 = agree, 5 = strongly agree**. A higher score means more agreement with that particular statement; it is not always more support for a train or ropeway.

| Field in `Respondents` | Current statement |
|---|---|
| `railStress` | Travelling by train would make my pilgrimage less stressful. |
| `railFlexibility` | I prefer travelling by road because I can leave at a time that suits me, rather than follow fixed train timings. |
| `railLuggageTransfer` | Carrying luggage when changing from a train to a bus or taxi would be difficult for me. |
| `railAccessibility` | The train would help people visit the shrines if taxis or tour packages are too costly for them. |
| `railFewerChangesPreference` | I would prefer fewer vehicle changes, even if the journey costs more. |
| `ropewayCostPreference` | I would pay more to use the ropeway instead of walking. |
| `ropewayHeightConcern` | I would feel afraid of the height while travelling in a ropeway. |
| `ropewayWaitUncertainty` | If the waiting time is uncertain, I would choose another mode of transport. |
| `ropewayTimePreference` | I would pay more to reach the shrine sooner. |
| `ropewayEffortPreference` | I would pay more for a journey that needs less physical effort. |
| `ropewayWalkingCostPreference` | I would walk to the shrine if it helped me save money. |

`railComfortPreference`, `railReliabilityPreference`, `ropewaySafety`, `ropewaySubsidy`, `ropewayWalkingPreference`, `priorityAccessibility` and `luckyDrawUpi` are removed/legacy questions. Some legacy columns remain in structured exports or old raw data. Do not relabel them as the new questions or pool old/new responses without reviewing the questionnaire version. Some existing statements were also reworded during development before version tracking was added.

## Conditional fields and new options

`<slug>` means the shrine name without spaces, e.g. `Kedarnath` or `HemkundSahib`. `<suffix>` is a stable route identifier, `<pair>` is e.g. `Kedarnath__Badrinath`, and `<index>` is a stopover row identifier.

| Source field | Meaning / stored options | Structured column |
|---|---|---|
| `ongoingDhamStatus_<slug>` | Completed / Currently underway / Planned next / Planned later | `DhamVisits.ongoingTripStatus` |
| `primaryTravelStatus_<suffix>` | Known / Not completed yet / mode not decided | `MainHaulSegments.travelStatus` |
| `interDhamTravelStatus_<pair>` | Known / Not completed yet / mode not decided | `InterDhamSegments.travelStatus` |
| `restBookingStatus_<index>` | Not decided / Prebooked by tour operator / Prebooked independently | `Stopovers.bookingStatus` |
| `restDurationChoice_<index>` | Selected duration range, or `exact` | `Stopovers.durationRange` |
| `restCostChoice_<index>` | Selected cost range, including ₹0–₹500, or `exact` | `Stopovers.costRange` |
| `restAccom_<index>` | Type of place, including Dormitory | `Stopovers.facilityType` |
| `stayBookingStatus_<slug>` | Not booked / Tour operator / Independently | `DhamVisits.stayBookingStatus` and `LastMileTrips.stayBookingStatus` |
| `stayAccom_<slug>` | Accommodation type, including Dormitory and Same day return (no overnight stay) | `DhamVisits.stayAccommodation` |
| `stayAccomCostRange_<slug>` | Cost range, No cost (₹0), or `exact` | `DhamVisits.stayAccommodationCostRange` |
| `stayAccomCost_<slug>` | Exact entered amount, or explicit `0` for same-day return | `DhamVisits.stayAccommodationCost` |
| `stayAccomCostBasis_<slug>` | Individual / Whole travelling group | `DhamVisits.stayAccommodationCostBasis` |
| `wtpRopewayShrine` | Shrine to which the willingness-to-pay answer applies | `Respondents.wtpRopewayShrine` |
| `wtpRopewayKedarnath` | WTP category; historic field name retained even when the question refers to another shrine | Interpret together with `wtpRopewayShrine` |

For planned-next shrines, unanswered duration/accommodation fields are **blank, not zero**. Prebooked accommodation details describe known arrangements, not a completed stay. Always join the booking/progress columns when interpreting them.

Same-day return explicitly saves numeric-text `0` and `No cost (₹0)`. For ordinary range selections, exact amount fields may be blank. Do not replace those blanks with zero.

Many travel time/fare buttons store a representative numeric category code, not an exact observation. Read `timeRange`, `costRange`, `timeBand`, `costBand` and fare-basis columns alongside the numeric value. The submission now preserves canonical English labels for numeric travel categories. Stopover and accommodation ranges remain categorical strings. Currency is INR; exact duration fields labelled hours are in hours; waiting fields labelled minutes are in minutes.

`primaryCost` is not necessarily a per-person amount. Interpret it with its fare basis (Per person, Group total, Whole vehicle, Included in package, Not sure). The local main-haul export now uses `cost` rather than the misleading old `costPerPerson` heading.

The ₹0–₹500 stopover option overlaps some narrower ranges. Retain the selected category as reported; do not treat these as mutually exclusive bins when combining answers across respondents.

## Multiple selections and challenge codes

The browser now sends repeated checkbox names intact, and `e.parameters` reads them as arrays. The server also accepts the older semicolon-joined format. This fixes cases where several selected shrines were incorrectly treated as one shrine name.

`Respondents.challenge` is a comma-joined display column; use the individual `ResponseFields` rows for reliable multi-select analysis. Current challenge values are:

`Shared Path With Ponies`, `Poor Cleanliness`, `Toilet Facilities`, `Drinking Water`, `Overcrowding`, `Unsafe Walking Path`, `Rest And Shelter`, `Medical Assistance`, `Long Waiting Time`, `High Or Unclear Prices`, `Other`.

The `Other` description is in `feedbackChallenge`. Existing challenge codes from older questionnaire versions are kept in historical data.

## Choice-card analysis

Join choice responses to `main_haul.csv` or `last_mile.csv` using experiment + `dham` + `task`. `task` is the original CSV Task value, not the position of a card within a respondent's random block. A/B/C identify alternatives within that task.

`choiceBlock` retains the random task selection map. `choiceDesignVersion` fingerprints the two CSV files for this questionnaire version. Archive these CSV files with your collected data; if the designs change, update the fingerprint and schema version before collecting further responses.

## Verification and limits

Run `node tests/sheets_schema.test.cjs`. This checks repeated checkbox parsing, all new question headers, booking/range mappings, blank versus zero values, CSV task IDs, raw field coverage and preservation of existing values when headers change. The tests mock Google Sheets and do not write to the live spreadsheet.

A browser submission was intercepted locally to check three separate selected shrines, two challenge choices, current attitude scores, same-day zero cost and omitted planned-stay values. `SURVEY_FIELD_SNAPSHOT.csv` records 270 live field definitions/options from that representative three-shrine scenario. It is an inspection snapshot, not an exhaustive dictionary of every conditional route or future questionnaire version.

The live Apps Script deployment and existing spreadsheet data have not been changed by this audit. Previously submitted rows are not automatically repaired. If earlier derived rows are missing or malformed, the raw sheets may allow reconstruction; preserve a spreadsheet backup before any backfill.

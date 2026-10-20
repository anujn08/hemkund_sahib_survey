# Pilgrimage Travel Survey

A mobile-friendly research survey about travel to Kedarnath, Badrinath, Gangotri, Yamunotri and Hemkund Sahib in Uttarakhand.

**Website:** https://anujn08.github.io/hemkund_sahib_survey/

## Run locally

From this directory, run:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Serve the files over HTTP rather than opening `index.html` directly, because the choice-card data is loaded from CSV files.

## Publish updates

Push changes to the `main` branch. The **Publish survey to GitHub Pages** workflow checks the JavaScript and Google Sheets column mappings, then publishes the HTML, CSS, JavaScript, choice-design CSV files and images.

GitHub repository settings must have **Pages ? Source ? GitHub Actions** enabled. Deployment progress is available under the Actions tab.

Only public site assets are uploaded to Pages. Respondent workbooks, test response JSON and local audit files are excluded from version control and the deployment artifact.

## Google Sheets backend

`google_apps_script.gs` is the source for the separately deployed Apps Script web app. Website updates do not update Apps Script automatically. After changing that file, replace the deployed Apps Script source and update its existing deployment to a new version.

The survey submits to the Apps Script `/exec` endpoint configured in `handleFormSubmit()` in `script.js`. Keep that URL aligned with the intended deployment.

See [DATA_ANALYSIS_NOTES.md](DATA_ANALYSIS_NOTES.md) for sheet names, question fields, conditional answers, coding and version tracking. The Sheets endpoint was tested before initial publication; future deployment/configuration changes should be checked with a clearly labelled test response.

## Validation

```sh
node --check script.js
node tests/sheets_schema.test.cjs
```

The schema tests mock Google Sheets and do not submit real responses.

## Main files

- `index.html`, `style.css`, `script.js`: questionnaire and responsive interface.
- `main_haul.csv`, `last_mile.csv`: stated-choice card designs.
- `images/`: survey images and backgrounds.
- `google_apps_script.gs`: Google Sheets ingestion and structured analysis tables.
- `tests/sheets_schema.test.cjs`: column-mapping and data-preservation checks.

Archive each questionnaire and choice-design version with the collected data. Keep respondent data out of this public repository.

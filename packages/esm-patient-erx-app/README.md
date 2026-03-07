# esm-patient-erx-app

Patient eRx printing microfrontend for the OpenMRS SPA.

This package adds an `eRx Print` action to the patient chart and generates a print-friendly prescription sheet for the active visit. The print flow is designed for OPD-style prescriptions and pulls data from the current visit note, recent visit notes, active medication orders, vitals, and shared prescription branding where available.

## What It Does

- Adds an `eRx Print` action in the patient chart workspace area
- Checks for an active visit before printing
- Requires a Visit Note encounter for the active visit
- Opens print preview directly through `react-to-print`
- Renders a prescription page with:
  - header with facility branding and encounter provider details
  - patient summary row
  - clinical record section
  - medication section
  - footer disclaimer and contact details

## Print Data Sources

The module combines data from these sources:

- Visit Note encounter for the active visit
- Up to three recent Visit Note encounters for clinical history
- Active drug orders for the patient
- Vitals observations mapped from configured concept UUIDs
- Shared prescription branding from `@openmrs/esm-appointments-app` when available

If appointments prescription config is available, the eRx print page reuses shared branding values such as logo, address, phone, email, website, watermark opacity, and provider attribute UUID mappings.

## Current Behavior

- The `eRx Print` action is always shown
- If there is no active visit, the module prompts the user to start one
- If there is an active visit but no Visit Note encounter, the module prompts the user to open visit notes first
- Printing currently targets one encounter per visit
- Visit Note is the supported encounter type for print content

## Configuration

The package defines its config schema in `src/config-schema.ts`.

### Core Encounter Config

- `visitNoteEncounterTypeUuid`
  - Encounter type used to fetch Visit Note encounters
- `encounterNoteTextConceptUuid`
  - Concept UUID used to extract free-text note content from Visit Note observations

### Clinic Info

- `clinicInfo.name`
  - Optional facility name override used in the print header
- `clinicInfo.tagline`
  - Reserved optional clinic tagline field
- `clinicInfo.contactLine`
  - Optional contact fallback line
- `clinicInfo.disclaimer`
  - Footer disclaimer text
- `clinicInfo.showDisclaimer`
  - Controls whether the footer disclaimer is shown

### Logo

- `logo.src`
  - Optional local logo fallback if shared prescription config is unavailable
- `logo.alt`
  - Accessible alt text for the logo

### Vitals Concepts

- `concepts.systolicBloodPressureUuid`
- `concepts.diastolicBloodPressureUuid`
- `concepts.pulseUuid`
- `concepts.temperatureUuid`
- `concepts.oxygenSaturationUuid`
- `concepts.respiratoryRateUuid`
- `concepts.heightUuid`
- `concepts.weightUuid`

These concept UUIDs are used to map observation values into the vitals block on the prescription.

### Medication Order Config

- `medicationOrders.careSettingUuid`
- `medicationOrders.drugOrderTypeUUID`

These values are used to fetch only drug orders and avoid mixing in other order types.

## Routes And Extensions

Defined in `src/routes.json`:

- workspace: `erx-print-workspace`
- modal: `erx-visit-note-required-modal`
- modal: `erx-print-preview-modal`
- workspace window group: `patient-chart`

Lifecycle registrations are in `src/index.ts`.

## Development

From this package directory:

```sh
yarn start
yarn build
yarn test
yarn lint
```

## Notes

- User-facing labels are translated through `translations/en.json`
- The print stylesheet is self-contained in `src/erx-print.scss`
- The module depends on `react-to-print` for browser print preview and print output

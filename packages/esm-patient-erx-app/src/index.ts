import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import erxActionButton from './erx-action-button.extension';

const moduleName = '@openmrs/esm-patient-erx-app';

const options = {
  featureName: 'patient-erx',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const erxActionMenu = getSyncLifecycle(erxActionButton, options);
export const erxPrintWorkspace = getAsyncLifecycle(() => import('./erx-print.workspace'), options);
export const erxVisitNoteRequiredModal = getAsyncLifecycle(() => import('./erx-note-required.modal'), options);
export const erxPrintPreviewModal = getAsyncLifecycle(() => import('./erx-print-preview.modal'), options);

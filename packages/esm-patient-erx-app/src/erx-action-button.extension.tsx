import React, { type ComponentProps, useCallback } from 'react';
import { Printer } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, showModal, useConfig } from '@openmrs/esm-framework';
import { launchStartVisitPrompt, usePatientChartStore, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from './config-schema';
import { hasVisitNoteForActiveVisit } from './erx.resource';

const ErxActionButton: React.FC = () => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { patientUuid, patient } = usePatientChartStore();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid ?? '');

  const openVisitNoteRequiredModal = useCallback(() => {
    const dispose = showModal('erx-visit-note-required-modal', {
      closeModal: () => dispose(),
    });
  }, []);

  const handleLaunch = useCallback(async () => {
    if (!patientUuid || !patient) {
      return;
    }

    const activeVisitUuid = currentVisit?.uuid;
    if (!activeVisitUuid) {
      launchStartVisitPrompt();
      return;
    }

    try {
      const hasVisitNote = await hasVisitNoteForActiveVisit(
        patientUuid,
        activeVisitUuid,
        config.visitNoteEncounterTypeUuid,
      );

      if (!hasVisitNote) {
        openVisitNoteRequiredModal();
        return;
      }
    } catch {
      openVisitNoteRequiredModal();
      return;
    }

    const dispose = showModal('erx-print-preview-modal', {
      closeModal: () => dispose(),
      patientUuid,
      patient,
      visitContext: currentVisit,
    });
  }, [patientUuid, patient, currentVisit, config.visitNoteEncounterTypeUuid, openVisitNoteRequiredModal]);

  return (
    <ActionMenuButton
      getIcon={(props: ComponentProps<typeof Printer>) => <Printer {...props} />}
      label={t('erxPrint', 'eRx Print')}
      iconDescription={t('print', 'Print')}
      handler={handleLaunch}
      type="erx-print"
    />
  );
};

export default ErxActionButton;

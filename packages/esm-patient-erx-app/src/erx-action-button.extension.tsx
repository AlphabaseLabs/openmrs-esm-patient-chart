import React, { type ComponentProps, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, PrinterIcon, showModal, useConfig } from '@openmrs/esm-framework';
import {
  type PatientChartWorkspaceActionButtonProps,
  usePatientChartStore,
  useStartVisitIfNeeded,
} from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from './config-schema';
import { hasVisitNoteForActiveVisit } from './erx.resource';

const ErxActionButton: React.FC<PatientChartWorkspaceActionButtonProps> = ({
  groupProps: { patientUuid, patient, visitContext },
}) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const startVisitIfNeeded = useStartVisitIfNeeded(patientUuid);
  const { visitContext: latestVisitContext } = usePatientChartStore(patientUuid);

  const openVisitNoteRequiredModal = useCallback(() => {
    const dispose = showModal('erx-visit-note-required-modal', {
      closeModal: () => dispose(),
    });
  }, []);

  const onBeforeWorkspaceLaunch = useCallback(async () => {
    const canProceedWithVisit = await startVisitIfNeeded();
    if (!canProceedWithVisit) {
      return false;
    }

    const activeVisitUuid = latestVisitContext?.uuid ?? visitContext?.uuid;
    if (!activeVisitUuid) {
      openVisitNoteRequiredModal();
      return false;
    }

    try {
      const hasVisitNote = await hasVisitNoteForActiveVisit(
        patientUuid,
        activeVisitUuid,
        config.visitNoteEncounterTypeUuid,
      );

      if (!hasVisitNote) {
        openVisitNoteRequiredModal();
        return false;
      }
    } catch {
      openVisitNoteRequiredModal();
      return false;
    }

    const dispose = showModal('erx-print-preview-modal', {
      closeModal: () => dispose(),
      patientUuid,
      patient,
      visitContext: latestVisitContext ?? visitContext,
    });

    return false;
  }, [
    startVisitIfNeeded,
    patientUuid,
    patient,
    latestVisitContext,
    visitContext,
    config.visitNoteEncounterTypeUuid,
    openVisitNoteRequiredModal,
  ]);

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof PrinterIcon>) => <PrinterIcon {...props} />}
      label={t('erxPrint', 'eRx Print')}
      workspaceToLaunch={{
        workspaceName: 'erx-print-workspace',
      }}
      onBeforeWorkspaceLaunch={onBeforeWorkspaceLaunch}
    />
  );
};

export default ErxActionButton;

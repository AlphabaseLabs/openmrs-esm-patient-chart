import React from 'react';
import { ErxPrintPage } from './erx-print.workspace';

interface ErxPrintPreviewModalProps {
  closeModal: () => void;
  patientUuid: string;
  patient: fhir.Patient;
  visitContext?: any;
}

const ErxPrintPreviewModal: React.FC<ErxPrintPreviewModalProps> = ({
  closeModal,
  patientUuid,
  patient,
  visitContext,
}) => {
  return (
    <div>
      <div style={{ position: 'absolute', inset: '-99999px', pointerEvents: 'none' }}>
        <ErxPrintPage
          patientUuid={patientUuid}
          patient={patient}
          visitContext={visitContext}
          hideToolbar
          autoPrint
          onAfterPrint={closeModal}
        />
      </div>
    </div>
  );
};

export default ErxPrintPreviewModal;

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { launchWorkspace } from '@openmrs/esm-framework';

interface ErxVisitNoteRequiredModalProps {
  closeModal: () => void;
}

const ErxVisitNoteRequiredModal: React.FC<ErxVisitNoteRequiredModalProps> = ({ closeModal }) => {
  const { t } = useTranslation();

  const handleOpenVisitNotes = useCallback(() => {
    launchWorkspace('visit-notes-form-workspace');
    closeModal();
  }, [closeModal]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('visitNoteRequired', 'Visit note required')} />
      <ModalBody>
        {t(
          'visitNoteRequiredDescription',
          'Please add a Visit Note encounter for the active visit before printing an eRx.',
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleOpenVisitNotes}>
          {t('openVisitNotes', 'Open Visit Notes')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default ErxVisitNoteRequiredModal;

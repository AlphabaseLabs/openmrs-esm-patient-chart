import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, InlineNotification } from '@carbon/react';
import { useReactToPrint } from 'react-to-print';
import { age, formatDate, getConfig, getPatientName, parseDate, useConfig, useSession } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from './config-schema';
import {
  getClinicalNote,
  getEducation,
  getEncounterProvider,
  getEncounterProviderName,
  getProfessionalAffiliation,
  getProviderAttributes,
  getProviderEmail,
  getPrimarySecondaryDiagnoses,
  getSpecialtyDisplay,
  useErxData,
  useProviderDetails,
} from './erx.resource';
import ErxPrintBody from './erx-print-body.component';
import ErxPrintFooter from './erx-print-footer.component';
import ErxPrintHeader from './erx-print-header.component';
import styles from './erx-print.scss';

interface ErxPrintWorkspaceProps extends DefaultPatientWorkspaceProps {
  visitContext?: any;
}

interface ErxPrintPageProps {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext?: any;
  hideToolbar?: boolean;
  autoPrint?: boolean;
  onAfterPrint?: () => void;
}

type SharedPrescriptionConfig = {
  logoUrl?: string;
  hospitalSlogan?: string;
  landlineNumber?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  website?: string;
  watermarkOpacity?: number;
  providerAttributeTypeUuids?: {
    education?: string;
    specialty?: string;
    specialization?: string;
    professionalAffiliation?: string;
    email?: string;
  };
};

export const ErxPrintPage: React.FC<ErxPrintPageProps> = ({
  patientUuid,
  patient,
  visitContext,
  hideToolbar = false,
  autoPrint = false,
  onAfterPrint,
}) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const session = useSession();
  const { data, isLoading, isValidating, refreshErxData, error } = useErxData(patientUuid, visitContext?.uuid);
  const [hasTriggeredAutoPrint, setHasTriggeredAutoPrint] = useState(false);
  const [hasPreparedAutoPrintData, setHasPreparedAutoPrintData] = useState(false);
  const [sharedPrescriptionConfig, setSharedPrescriptionConfig] = useState<SharedPrescriptionConfig | null | undefined>(
    undefined,
  );
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;

    getConfig('@openmrs/esm-appointments-app')
      .then((appointmentsConfig: any) => {
        if (!disposed) {
          setSharedPrescriptionConfig(appointmentsConfig?.prescriptionConfig ?? null);
        }
      })
      .catch(() => {
        if (!disposed) {
          setSharedPrescriptionConfig(null);
        }
      });

    return () => {
      disposed = true;
    };
  }, []);

  const patientName = getPatientName(patient);
  const patientGender = patient?.gender ? `${patient.gender[0].toUpperCase()}${patient.gender.slice(1)}` : '--';
  const patientAge = patient?.birthDate ? age(patient.birthDate) : '--';
  const mrn = patient?.identifier?.[0]?.value ?? '--';
  const currentVisitNote = data?.currentVisitNote;
  const recentVisitNotes = data?.recentVisitNotes ?? [];
  const activeMedicationOrders = data?.activeMedicationOrders ?? [];
  const currentVisitNoteText = getClinicalNote(currentVisitNote, config.encounterNoteTextConceptUuid);
  const encounterProvider = getEncounterProvider(currentVisitNote);
  const { providerDetails, isLoading: isLoadingProviderDetails } = useProviderDetails(encounterProvider?.uuid);
  const providerName = getEncounterProviderName(currentVisitNote);
  const diagnoses = getPrimarySecondaryDiagnoses(currentVisitNote);
  const encounterDate = currentVisitNote?.encounterDatetime
    ? formatPrescriptionDate(currentVisitNote.encounterDatetime)
    : '--';
  const printId = currentVisitNote?.uuid ? currentVisitNote.uuid.slice(0, 8).toUpperCase() : '--';
  const logoSrc = config.logo?.src || sharedPrescriptionConfig?.logoUrl;
  const clinicContactLine =
    config.clinicInfo.contactLine ||
    [sharedPrescriptionConfig?.address, sharedPrescriptionConfig?.landlineNumber].filter(Boolean).join(' | ');
  const facilityName = config.clinicInfo.name || session?.sessionLocation?.display || '--';
  const clinicTagline = config.clinicInfo.tagline || sharedPrescriptionConfig?.hospitalSlogan || '';
  const providerAttributes = useMemo(
    () => getProviderAttributes(providerDetails, encounterProvider),
    [providerDetails, encounterProvider],
  );
  const providerAttributeTypeUuids =
    config.providerAttributeTypeUuids ?? sharedPrescriptionConfig?.providerAttributeTypeUuids;
  const providerSpecialty = useMemo(
    () => getSpecialtyDisplay(providerAttributes, providerAttributeTypeUuids)?.toString()?.trim(),
    [providerAttributes, providerAttributeTypeUuids],
  );
  const providerEducation = useMemo(
    () => getEducation(providerAttributes, providerAttributeTypeUuids)?.toString()?.trim(),
    [providerAttributes, providerAttributeTypeUuids],
  );
  const providerProfessionalAffiliation = useMemo(
    () => getProfessionalAffiliation(providerAttributes, providerAttributeTypeUuids)?.toString()?.trim(),
    [providerAttributes, providerAttributeTypeUuids],
  );
  const providerEmail = useMemo(
    () => getProviderEmail(providerAttributes, providerAttributeTypeUuids)?.toString()?.trim(),
    [providerAttributes, providerAttributeTypeUuids],
  );
  const footerDetails = buildFooterDetails({
    locationLabel: t('location', 'Location'),
    phoneLabel: t('phone', 'Phone'),
    emailLabel: t('email', 'Email'),
    websiteLabel: t('website', 'Website'),
    locationValue: clinicContactLine || sharedPrescriptionConfig?.address,
    phoneValue: sharedPrescriptionConfig?.landlineNumber,
    emailValue: sharedPrescriptionConfig?.email,
    websiteValue: sharedPrescriptionConfig?.website,
  });

  const currentVisitNotesSection = useMemo(() => currentVisitNoteText, [currentVisitNoteText]);
  const isLoadingSharedPrescriptionConfig = sharedPrescriptionConfig === undefined;
  const isWaitingForProviderDetails = Boolean(encounterProvider?.uuid) && isLoadingProviderDetails;
  const isRefreshingErxData = autoPrint ? !hasPreparedAutoPrintData || isValidating : false;
  const isPrintReady =
    !isLoading && !isRefreshingErxData && !error && !isLoadingSharedPrescriptionConfig && !isWaitingForProviderDetails;

  const handlePrint = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: `eRx-${patientName || patientUuid}-${printId}`,
    preserveAfterPrint: false,
    onAfterPrint,
    pageStyle: `
      @page { margin: 0; size: A4; }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  });

  useEffect(() => {
    if (!autoPrint) {
      setHasPreparedAutoPrintData(true);
      return;
    }

    let disposed = false;
    setHasPreparedAutoPrintData(false);

    refreshErxData().finally(() => {
      if (!disposed) {
        setHasPreparedAutoPrintData(true);
      }
    });

    return () => {
      disposed = true;
    };
  }, [autoPrint, refreshErxData]);

  useEffect(() => {
    if (autoPrint && isPrintReady && !hasTriggeredAutoPrint) {
      setHasTriggeredAutoPrint(true);
      handlePrint();
    }
  }, [autoPrint, isPrintReady, hasTriggeredAutoPrint, handlePrint]);

  return (
    <>
      {!hideToolbar ? (
        <div className={styles.nonPrintActions}>
          <Button size="sm" kind="primary" onClick={handlePrint}>
            {t('printNow', 'Print')}
          </Button>
        </div>
      ) : null}

      {isLoading || isRefreshingErxData || isLoadingSharedPrescriptionConfig || isWaitingForProviderDetails ? (
        <InlineLoading description={t('loadingErx', 'Loading eRx data...')} />
      ) : null}

      {error ? (
        <InlineNotification
          lowContrast={false}
          kind="error"
          title={t('unableToLoadErxData', 'Unable to load eRx data')}
          subtitle={error.message}
        />
      ) : null}

      {isPrintReady
        ? (() => {
            const watermarkLogoUrl = config.watermark?.logoUrl || sharedPrescriptionConfig?.logoUrl;
            const watermarkOpacity = config.watermark?.opacity ?? sharedPrescriptionConfig?.watermarkOpacity ?? 0.04;
            return (
              <div className={styles.prescriptionPage} ref={printAreaRef}>
                {watermarkLogoUrl ? (
                  <div
                    className={styles.watermark}
                    style={{ '--watermark-opacity': watermarkOpacity } as React.CSSProperties}
                  >
                    <img src={watermarkLogoUrl} alt="" />
                  </div>
                ) : null}
                <ErxPrintHeader
                  logoSrc={logoSrc}
                  logoAlt={config.logo.alt || 'Facility logo'}
                  facilityName={facilityName}
                  clinicTagline={clinicTagline}
                  providerName={providerName}
                  providerSpecialty={providerSpecialty}
                  providerEducation={providerEducation}
                  providerProfessionalAffiliation={providerProfessionalAffiliation}
                  providerEmail={providerEmail}
                />
                <br />

                <div className={styles.headerDivider} aria-hidden="true" />

                <ErxPrintBody
                  patientName={patientName || '--'}
                  mrn={mrn}
                  patientAge={patientAge}
                  patientGender={patientGender}
                  hasVisitContext={Boolean(visitContext)}
                  encounterDate={encounterDate}
                  primaryDiagnosis={diagnoses.primary}
                  vitals={data.vitals}
                  showVitals={config.clinicInfo.showVitals}
                  recentVisitNotes={recentVisitNotes}
                  encounterNoteTextConceptUuid={config.encounterNoteTextConceptUuid}
                  activeMedicationOrders={activeMedicationOrders}
                  currentVisitNotesSection={currentVisitNotesSection}
                />

                <div className={styles.headerDivider} aria-hidden="true" />

                <ErxPrintFooter
                  showDisclaimer={config.clinicInfo.showDisclaimer}
                  disclaimer={config.clinicInfo.disclaimer}
                  footerDetails={footerDetails}
                />
              </div>
            );
          })()
        : null}
    </>
  );
};

const ErxPrintWorkspace: React.FC<ErxPrintWorkspaceProps> = ({ patientUuid, patient, visitContext }) => {
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  return <ErxPrintPage patientUuid={patientUuid} patient={patient} visitContext={visitContext ?? currentVisit} />;
};

export default ErxPrintWorkspace;

function buildFooterDetails(details: {
  locationLabel: string;
  phoneLabel: string;
  emailLabel: string;
  websiteLabel: string;
  locationValue?: string;
  phoneValue?: string;
  emailValue?: string;
  websiteValue?: string;
}) {
  return [
    details.locationValue ? `${details.locationLabel}: ${details.locationValue}` : '',
    details.phoneValue ? `${details.phoneLabel}: ${details.phoneValue}` : '',
    details.emailValue ? `${details.emailLabel}: ${details.emailValue}` : '',
    details.websiteValue ? `${details.websiteLabel}: ${details.websiteValue}` : '',
  ]
    .filter(Boolean)
    .join(' | ');
}

function formatPrescriptionDate(value: string) {
  const date = parseDate(value);

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace(/\s+/g, '-');
}

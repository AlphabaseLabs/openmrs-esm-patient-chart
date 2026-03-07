import React from 'react';
import { TextInput } from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './erx-print.scss';
import {
  getClinicalNote,
  getPrimarySecondaryDiagnoses,
  type ErxVitals,
  type MedicationOrder,
  type VisitNoteEncounter,
} from './erx.resource';

interface ErxPrintBodyProps {
  patientName: string;
  mrn: string;
  patientAge: string;
  patientGender: string;
  hasVisitContext: boolean;
  encounterDate: string;
  diagnosesCombined: string;
  vitals: ErxVitals;
  showVitals: boolean;
  recentVisitNotes: Array<VisitNoteEncounter>;
  encounterNoteTextConceptUuid: string;
  activeMedicationOrders: Array<MedicationOrder>;
  currentVisitNotesSection: string;
  watermarkLogoUrl?: string;
  watermarkOpacity?: number;
}

const ErxPrintBody: React.FC<ErxPrintBodyProps> = ({
  patientName,
  mrn,
  patientAge,
  patientGender,
  hasVisitContext,
  encounterDate,
  diagnosesCombined,
  vitals,
  showVitals,
  recentVisitNotes,
  encounterNoteTextConceptUuid,
  activeMedicationOrders,
  currentVisitNotesSection,
  watermarkLogoUrl,
  watermarkOpacity,
}) => {
  const { t } = useTranslation();

  return (
    <section className={styles.body}>
      <div className={styles.patientSection}>
        <div className={styles.patientSummaryGrid}>
          <div className={styles.patientSummaryField}>
            <TextInput id="erx-mrn" labelText={t('mrn', 'MRN')} value={mrn} readOnly size="sm" />
          </div>
          <div className={styles.patientSummaryField}>
            <TextInput
              id="erx-patient-name"
              labelText={t('patientName', 'Patient name')}
              value={patientName || '--'}
              readOnly
              size="sm"
            />
          </div>
          <div className={styles.patientSummaryField}>
            <TextInput
              id="erx-age-gender"
              labelText={t('ageGender', 'Age / Gender')}
              value={`${patientAge} / ${patientGender}`}
              readOnly
              size="sm"
            />
          </div>
          <div className={styles.patientSummaryField}>
            <TextInput
              id="erx-visit-panel"
              labelText={t('visitPanel', 'Visit/Panel')}
              value={hasVisitContext ? t('activeVisit', 'Active Visit') : '--'}
              readOnly
              size="sm"
            />
          </div>
          <div className={styles.patientSummaryField}>
            <TextInput
              id="erx-encounter-date"
              labelText={t('encounterDate', 'Encounter date')}
              value={encounterDate}
              readOnly
              size="sm"
            />
          </div>
          <div className={styles.patientSummaryField}>
            <TextInput
              id="erx-diagnosis"
              labelText={t('diagnosis', 'Diagnosis')}
              value={diagnosesCombined || '--'}
              readOnly
              size="sm"
            />
          </div>
        </div>
      </div>

      <section className={styles.prescriptionBody}>
        <div className={styles.prescriptionColumns}>
          <div className={styles.diagnosisColumn}>
            <div className={styles.diagnosisSection}>
              <h3 className={styles.diagnosisTitle}>{t('clinicalRecord', 'Clinical Record')}</h3>
              <div className={`${styles.diagnosisContent} ${styles.erxClinicalContent}`}>
                {showVitals ? (
                  <div className={styles.erxVitalsGrid}>
                    <VitalsCell label="WT (kg)" value={stripVitalUnit(vitals.wt)} />
                    <VitalsCell label="HT (cm)" value={stripVitalUnit(vitals.ht)} />
                    <VitalsCell label="BP (mmHg)" value={stripBloodPressureUnit(vitals.bp)} />
                    <VitalsCell label="Pulse (/min)" value={stripVitalUnit(vitals.pulse)} />
                    <VitalsCell label="Temp (C)" value={stripVitalUnit(vitals.temp)} />
                    <VitalsCell label="SpO2 (%)" value={stripVitalUnit(vitals.spo2)} />
                  </div>
                ) : null}

                <h3 className={styles.diagnosisTitle}>{t('patientComplaint', 'Patient Complaint')}</h3>
                <div className={styles.erxNoteList}>
                  {recentVisitNotes.length ? (
                    recentVisitNotes.map((note) => {
                      const noteDiagnoses = getPrimarySecondaryDiagnoses(note);
                      const noteText = truncateSlipText(getClinicalNote(note, encounterNoteTextConceptUuid), 350);

                      return (
                        <div key={note.uuid} className={styles.erxNoteItem}>
                          <div className={styles.erxMetaText}>
                            {formatDate(parseDate(note.encounterDatetime), { mode: 'wide', time: true })}
                          </div>
                          <div className={styles.erxPlainText}>{noteDiagnoses.combined || '--'}</div>
                          <div className={styles.erxBodyText}>{noteText || '--'}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.erxBodyText}>--</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.columnDivider}></div>

          <div className={styles.rxColumn}>
            <div className={styles.rxHeader}>
              <span className={styles.rxSymbol}>
                R<sub>x</sub>
              </span>
            </div>

            <div className={styles.erxMedicationList}>
              <h3 className={styles.diagnosisTitle}>{t('medications', 'Medication')}</h3>
              {activeMedicationOrders.length ? (
                <ol>
                  {activeMedicationOrders.map((medication) => (
                    <li key={medication.uuid} className={styles.erxMedicationItem}>
                      <div className={styles.erxBoldText}>
                        {medication.drug?.display || '--'}
                        {medication.drug?.strength ? ` (${medication.drug.strength})` : ''}
                      </div>
                      <div className={styles.erxBodyText}>{formatMedicationDetails(medication, t)}</div>
                      <div className={styles.erxBodyText}>
                        {medication.dosingInstructions || medication.instructions || '--'}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className={styles.erxBodyText}>--</div>
              )}
            </div>

            <div className={styles.erxOthersSection}>
              <div className={styles.erxSectionLabel}>{t('others', 'Others')}</div>
              <div className={styles.erxOthersContent}>{currentVisitNotesSection || '--'}</div>
            </div>

            {watermarkLogoUrl ? (
              <div
                className={styles.watermark}
                data-alignment="center"
                style={{ '--watermark-opacity': watermarkOpacity ?? 0.04 } as React.CSSProperties}
              >
                <img src={watermarkLogoUrl} alt="Watermark" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className={styles.signatureArea}>
        <div className={styles.signatureLine}></div>
        <p className={styles.signatureText}>{t('signature', 'Signature')}</p>
      </div>
    </section>
  );
};

function VitalsCell({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.erxVitalsCell}>
      <span>{label}</span>
      <div className={styles.erxPlainText}>{value || '--'}</div>
    </div>
  );
}

function stripVitalUnit(value?: string) {
  if (!value) {
    return '--';
  }

  return value.replace(/\s*[A-Za-z%°/]+$/u, '').trim() || value;
}

function stripBloodPressureUnit(value?: string) {
  if (!value) {
    return '--';
  }

  return value.replace(/\s*mmHg/giu, '').trim() || value;
}

function truncateSlipText(value: string, maxChars: number) {
  if (!value) {
    return '';
  }

  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars).trimEnd()}...`;
}

function formatMedicationDetails(medication: MedicationOrder, t: (key: string, fallback: string) => string) {
  const details = [
    `${medication.dose ?? '--'} ${medication.doseUnits?.display || ''}`.trim(),
    medication.frequency?.display,
    medication.route?.display,
    medication.duration != null
      ? `${t('duration', 'Duration')}: ${medication.duration} ${medication.durationUnits?.display || ''}`.trim()
      : '',
    medication.quantity != null
      ? `${t('quantity', 'Qty')}: ${medication.quantity} ${medication.quantityUnits?.display || ''}`.trim()
      : '',
    medication.numRefills != null ? `${t('refills', 'Refills')}: ${medication.numRefills}` : '',
  ];

  return details.filter(Boolean).join(' | ');
}

export default ErxPrintBody;

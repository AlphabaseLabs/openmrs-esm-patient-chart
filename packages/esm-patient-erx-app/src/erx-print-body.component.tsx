import React from 'react';
import { parseDate } from '@openmrs/esm-framework';
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
  primaryDiagnosis: string;
  vitals: ErxVitals;
  showVitals: boolean;
  recentVisitNotes: Array<VisitNoteEncounter>;
  encounterNoteTextConceptUuid: string;
  activeMedicationOrders: Array<MedicationOrder>;
  currentVisitNotesSection: string;
}

const ErxPrintBody: React.FC<ErxPrintBodyProps> = ({
  patientName,
  mrn,
  patientAge,
  patientGender,
  hasVisitContext,
  encounterDate,
  primaryDiagnosis,
  vitals,
  showVitals,
  recentVisitNotes,
  encounterNoteTextConceptUuid,
  activeMedicationOrders,
  currentVisitNotesSection,
}) => {
  const { t } = useTranslation();

  return (
    <section className={styles.body}>
      <div className={styles.patientSection}>
        <div className={styles.patientSummaryGrid}>
          <PatientSummaryItem label={t('mrnNumber', 'MR #')} value={mrn} />
          <PatientSummaryItem label={t('patientName', 'Patient Name')} value={patientName || '--'} />
          <PatientSummaryItem label={t('ageGender', 'Age / Gender')} value={`${patientAge} / ${patientGender}`} />
          <PatientSummaryItem label={t('diagnosis', 'Diagnosis')} value={primaryDiagnosis || '--'} />
          <PatientSummaryItem
            label={t('visitPanel', 'Visit/Panel')}
            value={hasVisitContext ? t('activeVisit', 'Active Visit') : '--'}
          />
        </div>
      </div>

      <div className={styles.sectionDivider} aria-hidden="true" />

      <section className={styles.prescriptionBody}>
        <div className={styles.prescriptionColumns}>
          <div className={styles.diagnosisColumn}>
            <div className={styles.diagnosisSection}>
              <div className={styles.clinicalRecordSection}>
                <h3 className={styles.diagnosisTitle}>{t('clinicalRecord', 'Clinical Record')}</h3>
                <div className={styles.erxClinicalContent}>
                  {showVitals ? (
                    <div className={styles.erxVitalsList}>
                      <ClinicalRecordItem label="WT (kg)" value={stripVitalUnit(vitals.wt)} />
                      <ClinicalRecordItem label="HT (cm)" value={stripVitalUnit(vitals.ht)} />
                      <ClinicalRecordItem label="BP (mmHg)" value={stripBloodPressureUnit(vitals.bp)} />
                      <ClinicalRecordItem label="Pulse (/min)" value={stripVitalUnit(vitals.pulse)} />
                      <ClinicalRecordItem label="Temp (C)" value={stripVitalUnit(vitals.temp)} />
                      <ClinicalRecordItem label="SpO2 (%)" value={stripVitalUnit(vitals.spo2)} />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.patientComplaintSection}>
                <h3 className={styles.diagnosisTitle}>{t('patientComplaint', 'Patient Complaint')}</h3>
                <div className={styles.erxNoteList}>
                  {recentVisitNotes.length ? (
                    recentVisitNotes.map((note) => {
                      const noteDiagnoses = getPrimarySecondaryDiagnoses(note);
                      const noteText = truncateSlipText(getClinicalNote(note, encounterNoteTextConceptUuid), 350);

                      return (
                        <div key={note.uuid} className={styles.erxNoteItem}>
                          <div className={styles.erxComplaintDate}>
                            {formatPrescriptionDate(note.encounterDatetime)}
                          </div>
                          <ComplaintDiagnosisItem
                            label={t('primary', 'Primary')}
                            value={noteDiagnoses.primary || '--'}
                          />
                          {noteDiagnoses.secondary ? (
                            <ComplaintDiagnosisItem
                              label={t('secondary', 'Secondary')}
                              value={noteDiagnoses.secondary}
                            />
                          ) : null}
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
              <div className={styles.rxDate}>
                <span className={styles.rxDateLabel}>{t('date', 'Date')}:</span>{' '}
                <span className={styles.rxDateValue}>{encounterDate}</span>
              </div>
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
                      {medication.dosingInstructions || medication.instructions ? (
                        <div className={styles.erxBodyText}>
                          {t('instructions', 'Instructions')}:{' '}
                          {medication.dosingInstructions || medication.instructions}
                        </div>
                      ) : null}
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

function PatientSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.patientSummaryField}>
      <span className={styles.patientSummaryLabel}>{label}:</span>{' '}
      <span className={styles.patientSummaryValue}>{value || '--'}</span>
    </div>
  );
}

function ClinicalRecordItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.clinicalRecordItem}>
      <span className={styles.clinicalRecordLabel}>{label}:</span>{' '}
      <span className={styles.clinicalRecordValue}>{value || '--'}</span>
    </div>
  );
}

function ComplaintDiagnosisItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.complaintDiagnosisItem}>
      <span className={styles.complaintDiagnosisLabel}>{label}:</span>{' '}
      <span className={styles.complaintDiagnosisValue}>{value || '--'}</span>
    </div>
  );
}

function formatPrescriptionDate(value?: string) {
  if (!value) {
    return '--';
  }

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
  ];

  return details.filter(Boolean).join(' | ');
}

export default ErxPrintBody;

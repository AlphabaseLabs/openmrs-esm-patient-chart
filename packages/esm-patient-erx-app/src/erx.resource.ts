import { useCallback } from 'react';
import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import type { ConfigObject } from './config-schema';

const visitNoteRepresentation =
  'custom:(uuid,display,encounterDatetime,visit:(uuid,startDatetime),' +
  'encounterProviders:(encounterRole:(uuid,display),provider:(uuid,person:(uuid,display),attributes:(voided,value,attributeType:(uuid,display)))),' +
  'diagnoses:(uuid,display,rank,certainty,voided),' +
  'obs:(uuid,concept:(uuid,display),value,obsDatetime))';

const activeMedicationRepresentation =
  'custom:(uuid,dateActivated,dosingType,dosingInstructions,instructions,drug:(uuid,display,strength),dose,' +
  'doseUnits:(uuid,display),frequency:(uuid,display),route:(uuid,display),duration,durationUnits:(uuid,display),' +
  'quantity,quantityUnits:(uuid,display),numRefills)';

interface VisitRef {
  uuid: string;
  startDatetime: string;
}

interface Diagnosis {
  display?: string;
  rank?: number;
  voided?: boolean;
}

interface Observation {
  concept: {
    uuid: string;
    display: string;
  };
  value?: string;
}

export interface VisitNoteEncounter {
  uuid: string;
  encounterDatetime: string;
  visit?: VisitRef;
  diagnoses?: Array<Diagnosis>;
  encounterProviders?: Array<{
    provider?: Provider;
  }>;
  obs?: Array<Observation>;
}

interface VisitNotesResponse {
  results: Array<VisitNoteEncounter>;
}

export interface MedicationOrder {
  uuid: string;
  dateActivated: string;
  dosingType?: string;
  dosingInstructions?: string;
  instructions?: string;
  drug?: {
    display?: string;
    strength?: string;
  };
  dose?: number;
  doseUnits?: {
    display?: string;
  };
  frequency?: {
    display?: string;
  };
  route?: {
    display?: string;
  };
  duration?: number;
  durationUnits?: {
    display?: string;
  };
  quantity?: number;
  quantityUnits?: {
    display?: string;
  };
  numRefills?: number;
}

interface OrdersResponse {
  results: Array<MedicationOrder>;
}

interface FhirObservation {
  code?: {
    coding?: Array<{
      code?: string;
    }>;
  };
  valueQuantity?: {
    value?: number;
    unit?: string;
  };
}

interface FhirObservationBundle {
  entry?: Array<{ resource?: FhirObservation }>;
}

export interface ProviderAttribute {
  voided?: boolean;
  value?: any;
  attributeType?: {
    uuid?: string;
    display?: string;
  };
}

export interface Provider {
  uuid?: string;
  attributes?: ProviderAttribute[];
  person?: {
    display?: string;
  };
}

interface ProviderDetails {
  attributes?: ProviderAttribute[];
}

export interface ErxVitals {
  wt?: string;
  ht?: string;
  bp?: string;
  pulse?: string;
  temp?: string;
  spo2?: string;
  rr?: string;
}

export interface ErxData {
  currentVisitNote?: VisitNoteEncounter;
  recentVisitNotes: Array<VisitNoteEncounter>;
  activeMedicationOrders: Array<MedicationOrder>;
  vitals: ErxVitals;
}

function getProviderUrl(providerUuid?: string) {
  return providerUuid
    ? `${restBaseUrl}/provider/${providerUuid}?v=custom:(uuid,display,name,person:(uuid,display),attributes:(voided,value,attributeType:(uuid,display)))`
    : null;
}

export function useProviderDetails(providerUuid?: string) {
  const providerUrl = getProviderUrl(providerUuid);
  const { data, isLoading, mutate, error } = useSWR<{ data: ProviderDetails }, Error>(providerUrl, openmrsFetch, {
    revalidateOnMount: true,
  });

  return {
    providerDetails: data?.data,
    isLoading,
    refreshProviderDetails: () => mutate(),
    error,
  };
}

export function useErxData(patientUuid: string, activeVisitUuid?: string) {
  const config = useConfig<ConfigObject>();

  const visitNotesUrl = patientUuid
    ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${config.visitNoteEncounterTypeUuid}&v=${visitNoteRepresentation}`
    : null;

  const activeMedsUrl = patientUuid
    ? `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${config.medicationOrders.careSettingUuid}&orderTypes=${config.medicationOrders.drugOrderTypeUUID}&excludeCanceledAndExpired=true&v=${activeMedicationRepresentation}`
    : null;

  const conceptCodes = [
    config.concepts.systolicBloodPressureUuid,
    config.concepts.diastolicBloodPressureUuid,
    config.concepts.pulseUuid,
    config.concepts.temperatureUuid,
    config.concepts.oxygenSaturationUuid,
    config.concepts.respiratoryRateUuid,
    config.concepts.heightUuid,
    config.concepts.weightUuid,
  ];
  const vitalsUrl = patientUuid
    ? `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${conceptCodes.join(
        ',',
      )}&_summary=data&_sort=-date&_count=100`
    : null;

  const {
    data: visitNotesData,
    isLoading: isLoadingVisitNotes,
    isValidating: isValidatingVisitNotes,
    mutate: mutateVisitNotes,
    error: visitNotesError,
  } = useSWR<{ data: VisitNotesResponse }, Error>(visitNotesUrl, openmrsFetch, {
    revalidateOnMount: true,
  });
  const {
    data: activeMedsData,
    isLoading: isLoadingMeds,
    isValidating: isValidatingMeds,
    mutate: mutateActiveMeds,
    error: medsError,
  } = useSWR<{ data: OrdersResponse }, Error>(activeMedsUrl, openmrsFetch, {
    revalidateOnMount: true,
  });
  const {
    data: vitalsData,
    isLoading: isLoadingVitals,
    isValidating: isValidatingVitals,
    mutate: mutateVitals,
    error: vitalsError,
  } = useSWR<{ data: FhirObservationBundle }, Error>(vitalsUrl, openmrsFetch, {
    revalidateOnMount: true,
  });

  const sortedVisitNotes = [...(visitNotesData?.data?.results ?? [])].sort(
    (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
  );

  const currentVisitNote = activeVisitUuid
    ? sortedVisitNotes.find((encounter) => encounter?.visit?.uuid === activeVisitUuid)
    : undefined;

  const currentProviderUuid = getEncounterProvider(currentVisitNote)?.uuid;
  const currentVisitNoteDate = currentVisitNote ? new Date(currentVisitNote.encounterDatetime).getTime() : Number.NaN;

  const recentVisitNotes = currentVisitNote
    ? sortedVisitNotes
        .filter((encounter) => {
          const encounterProviderUuid = getEncounterProvider(encounter)?.uuid;
          return (
            encounter.uuid !== currentVisitNote.uuid &&
            new Date(encounter.encounterDatetime).getTime() < currentVisitNoteDate &&
            encounterProviderUuid === currentProviderUuid
          );
        })
        .slice(0, 3)
    : [];

  const activeMedicationOrders =
    activeMedsData?.data?.results?.sort(
      (a, b) => new Date(b.dateActivated).getTime() - new Date(a.dateActivated).getTime(),
    ) ?? [];

  const vitals = mapLatestVitals(vitalsData?.data?.entry ?? [], config);
  const refreshErxData = useCallback(async () => {
    await Promise.all([mutateVisitNotes(), mutateActiveMeds(), mutateVitals()]);
  }, [mutateVisitNotes, mutateActiveMeds, mutateVitals]);

  return {
    data: {
      currentVisitNote,
      recentVisitNotes,
      activeMedicationOrders,
      vitals,
    } as ErxData,
    isLoading: isLoadingVisitNotes || isLoadingMeds || isLoadingVitals,
    isValidating: isValidatingVisitNotes || isValidatingMeds || isValidatingVitals,
    refreshErxData,
    error: visitNotesError ?? medsError ?? vitalsError,
  };
}

export async function hasVisitNoteForActiveVisit(
  patientUuid: string,
  visitUuid: string,
  visitNoteEncounterTypeUuid: string,
): Promise<boolean> {
  const url = `${restBaseUrl}/encounter?patient=${patientUuid}&visit=${visitUuid}&encounterType=${visitNoteEncounterTypeUuid}&v=${visitNoteRepresentation}`;
  const response = await openmrsFetch<{ results: Array<VisitNoteEncounter> }>(url);
  return Boolean(response?.data?.results?.length);
}

function mapLatestVitals(entries: Array<{ resource?: FhirObservation }>, config: ConfigObject): ErxVitals {
  const values = new Map<string, string>();

  for (const entry of entries) {
    const conceptCode = entry.resource?.code?.coding?.[0]?.code;
    const rawValue = entry.resource?.valueQuantity?.value;
    const unit = entry.resource?.valueQuantity?.unit;

    if (!conceptCode || rawValue == null || values.has(conceptCode)) {
      continue;
    }

    values.set(conceptCode, unit ? `${rawValue} ${unit}` : `${rawValue}`);
  }

  const systolic = values.get(config.concepts.systolicBloodPressureUuid);
  const diastolic = values.get(config.concepts.diastolicBloodPressureUuid);

  return {
    wt: values.get(config.concepts.weightUuid),
    ht: values.get(config.concepts.heightUuid),
    bp: systolic || diastolic ? `${systolic ?? '--'} / ${diastolic ?? '--'}` : undefined,
    pulse: values.get(config.concepts.pulseUuid),
    temp: values.get(config.concepts.temperatureUuid),
    spo2: values.get(config.concepts.oxygenSaturationUuid),
    rr: values.get(config.concepts.respiratoryRateUuid),
  };
}

export function getPrimarySecondaryDiagnoses(encounter?: VisitNoteEncounter) {
  const diagnoses = encounter?.diagnoses?.filter((diagnosis) => !diagnosis?.voided && diagnosis?.display) ?? [];

  const primary = diagnoses
    .filter((diagnosis) => diagnosis.rank === 1)
    .map((diagnosis) => diagnosis.display)
    .join(', ');
  const secondary = diagnoses
    .filter((diagnosis) => diagnosis.rank === 2)
    .map((diagnosis) => diagnosis.display)
    .join(', ');

  return {
    primary,
    secondary,
    combined: [primary, secondary].filter(Boolean).join(' | '),
  };
}

export function getClinicalNote(encounter?: VisitNoteEncounter, noteConceptUuid?: string) {
  if (!encounter || !noteConceptUuid) {
    return '';
  }

  return encounter.obs?.find((observation) => observation?.concept?.uuid === noteConceptUuid)?.value?.toString() ?? '';
}

export function getEncounterProviderName(encounter?: VisitNoteEncounter) {
  return getEncounterProvider(encounter)?.person?.display ?? '';
}

export function getEncounterProvider(encounter?: VisitNoteEncounter): Provider | undefined {
  return encounter?.encounterProviders?.[0]?.provider;
}

export function getProviderAttributes(
  providerDetails: ProviderDetails | undefined,
  encounterProvider: Provider | undefined,
): ProviderAttribute[] {
  const all = (providerDetails?.attributes ?? encounterProvider?.attributes ?? []) as ProviderAttribute[];
  return all.filter((attribute) => !attribute?.voided);
}

export function getEducation(
  providerAttributes: ProviderAttribute[],
  attributeTypeUuids?: { education?: string; specialty?: string },
) {
  return providerAttributes?.find((attribute) => attribute?.attributeType?.uuid === attributeTypeUuids?.education)
    ?.value;
}

export function getSpecialtyDisplay(
  providerAttributes: ProviderAttribute[],
  attributeTypeUuids?: { education?: string; specialty?: string },
) {
  return providerAttributes?.find((attribute) => attribute?.attributeType?.uuid === attributeTypeUuids?.specialty)
    ?.value?.display;
}

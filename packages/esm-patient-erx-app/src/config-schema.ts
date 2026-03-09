import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  visitNoteEncounterTypeUuid: {
    _type: Type.UUID,
    _default: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
    _description: 'Encounter type UUID used by Visit Note encounters',
  },
  encounterNoteTextConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _description: 'Visit note concept UUID used for free-text notes',
  },
  clinicInfo: {
    name: {
      _type: Type.String,
      _default: '',
      _description: 'Clinic or facility name shown in print header',
    },
    tagline: {
      _type: Type.String,
      _default: '',
      _description: 'Optional clinic tagline shown under the clinic name',
    },
    contactLine: {
      _type: Type.String,
      _default: '',
      _description: 'Optional address/phone line shown in print header',
    },
    disclaimer: {
      _type: Type.String,
      _default: 'Please note each OPD Consultation inlcudes one free follow-up visit within 7 days for same complaint',
      _description: 'Optional footer disclaimer text',
    },
    showDisclaimer: {
      _type: Type.Boolean,
      _default: true,
      _description: 'If true, show the footer disclaimer line on the printed prescription',
    },
    showVitals: {
      _type: Type.Boolean,
      _default: true,
      _description: 'If true, show the vitals block in the clinical record section',
    },
  },
  logo: {
    src: {
      _type: Type.String,
      _default: '/emr/clinic-logo.png',
      _description: 'A path or URL to a facility logo image',
    },
    alt: {
      _type: Type.String,
      _default: 'Facility logo',
      _description: 'Alternative text for the logo image',
    },
  },
  watermark: {
    logoUrl: {
      _type: Type.String,
      _default: '',
      _description:
        'Path or URL for the watermark logo. If empty, falls back to prescription config logo from appointments app.',
    },
    opacity: {
      _type: Type.Number,
      _default: 0.04,
      _description: 'Opacity of the watermark (0-1). If not set, falls back to prescription config.',
    },
  },
  concepts: {
    systolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    diastolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    pulseUuid: {
      _type: Type.ConceptUuid,
      _default: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    temperatureUuid: {
      _type: Type.ConceptUuid,
      _default: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    oxygenSaturationUuid: {
      _type: Type.ConceptUuid,
      _default: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    respiratoryRateUuid: {
      _type: Type.ConceptUuid,
      _default: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    heightUuid: {
      _type: Type.ConceptUuid,
      _default: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  medicationOrders: {
    careSettingUuid: {
      _type: Type.UUID,
      _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
      _description: 'Care setting UUID used when fetching medication orders',
    },
    drugOrderTypeUUID: {
      _type: Type.UUID,
      _default: '131168f4-15f5-102d-96e4-000c29c2a5d7',
      _description: "UUID for the 'Drug' order type to fetch medications",
    },
  },
  providerAttributeTypeUuids: {
    education: {
      _type: Type.UUID,
      _default: '1d482076-79a0-48ac-8e9f-5b846b6af67f',
      _description: 'Provider attribute type UUID for Education (degrees, certifications)',
    },
    specialty: {
      _type: Type.UUID,
      _default: '6bae5f5c-b860-4c71-841d-bb6428ca9fbb',
      _description: 'Provider attribute type UUID for Specialty',
    },
    specialization: {
      _type: Type.UUID,
      _default: '0a3c4d5e-6f7b-4c8d-1e2f-4a5b6c7d8e9f',
      _description: 'Provider attribute type UUID for Specialization',
    },
    professionalAffiliation: {
      _type: Type.UUID,
      _default: '0a3c4d5e-6f7b-4c8d-1e2f-5a6b7c8d9e0f',
      _description: 'Provider attribute type UUID for Professional Affiliation',
    },
    email: {
      _type: Type.UUID,
      _default: '9383828f-36f7-4962-9e08-ae2867716e6f',
      _description: 'Provider attribute type UUID for Email',
    },
  },
};

export interface ConfigObject {
  visitNoteEncounterTypeUuid: string;
  encounterNoteTextConceptUuid: string;
  clinicInfo: {
    name: string;
    tagline: string;
    contactLine: string;
    disclaimer: string;
    showDisclaimer: boolean;
    showVitals: boolean;
  };
  logo: {
    src: string;
    alt: string;
  };
  watermark?: {
    logoUrl?: string;
    opacity?: number;
  };
  concepts: {
    systolicBloodPressureUuid: string;
    diastolicBloodPressureUuid: string;
    pulseUuid: string;
    temperatureUuid: string;
    oxygenSaturationUuid: string;
    respiratoryRateUuid: string;
    heightUuid: string;
    weightUuid: string;
  };
  medicationOrders: {
    careSettingUuid: string;
    drugOrderTypeUUID: string;
  };
  providerAttributeTypeUuids: {
    education: string;
    specialty: string;
    specialization: string;
    professionalAffiliation: string;
    email: string;
  };
}

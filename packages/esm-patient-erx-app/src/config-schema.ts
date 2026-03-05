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
      _default: '',
      _description: 'A path or URL to a facility logo image',
    },
    alt: {
      _type: Type.String,
      _default: 'Facility logo',
      _description: 'Alternative text for the logo image',
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
}

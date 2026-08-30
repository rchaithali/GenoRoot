import type { IntakeState } from "../types/intake";

export const initialIntakeState: IntakeState = {
  // Supporting patient context
  currentAge: null,
  sex: null,

  // A · Personal & Family Hair Loss History
  age_hair_loss_began: null,
  duration: null,
  family_history: [],
  pattern: [],

  // B · Hormonal & Health Influences
  diagnosed_conditions: [],
  menstrual_cycle: null,
  pregnancy_related: null,
  adult_acne_oily_skin: null,
  excess_body_facial_hair: null,

  // C · Lifestyle & Environmental Triggers
  past_6_months: [],

  habits: {
    smoking: null,
    smoking_severity: null,
    alcohol: null,
    hard_water: null,
    hair_wash_frequency: null,
    heating_tools_styling_chemicals: null,
    salon_treatments: null,
    salon_treatment_detail: "",
  },

  // D · Current Hair Care & Treatments
  products: {
    "OTC/Medicated Shampoos": {
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    },
    "Hair Oils/Serums": {
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    },
    "Topical Minoxidil": {
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    },
    "Oral Minoxidil": {
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    },
    Supplements: {
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    },
  },

  procedures: {
    "PRP/GFC/iPRF": {
      done: false,
      sessions: null,
      helped: null,
    },
    "Stem Cells/Exosomes": {
      done: false,
      sessions: null,
      helped: null,
    },
    "Hair Transplant": {
      done: false,
      sessions: null,
      helped: null,
    },
    Other: {
      done: false,
      sessions: null,
      helped: null,
    },
  },

  past_treatment_side_effects: null,
  describe: "",

  // E · Sample Collection & Consent
  sample_type: null,
  consent: null,
};
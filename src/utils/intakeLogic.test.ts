import {
  describe,
  expect,
  it,
} from "vitest";

import { initialIntakeState } from "../data/initialIntakeState";

import type {
  IntakeState,
} from "../types/intake";

import {
  buildFinalOutput,
  getMissingRequiredAnswers,
  isIntakeComplete,
  validateIntakeConsistency,
} from "./intakeLogic";

function makeCompleteFemalePatient(): IntakeState {
  return {
    currentAge: 34,
    sex: "Female",

    age_hair_loss_began: 29,

    duration:
      "Over a year",

    family_history: [
      "Father had hair loss",
    ],

    pattern: [
      "Widening part line",
      "Diffuse thinning",
    ],

    diagnosed_conditions: [
      "PCOS/PCOD",
    ],

    menstrual_cycle:
      "Irregular",

    pregnancy_related:
      "Not applicable",

    adult_acne_oily_skin:
      "Yes",

    excess_body_facial_hair:
      "Yes",

    past_6_months: [
      "High stress or emotional trauma",
    ],

    habits: {
      smoking: "No",
      smoking_severity: null,
      alcohol: "No",
      hard_water: "Yes",

      hair_wash_frequency:
        "Alternate Days",

      heating_tools_styling_chemicals:
        "Yes",

      salon_treatments:
        "Yes",

      salon_treatment_detail:
        "Keratin treatment",
    },

    products: {
      "OTC/Medicated Shampoos": {
        used: true,
        duration: "3-6mo",
        helped: "Yes",
        side_effects: "No",
      },

      "Hair Oils/Serums": {
        used: true,
        duration: ">6mo",
        helped: "Yes",
        side_effects: "No",
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
        used: true,
        duration: ">6mo",
        helped: "No",
        side_effects: "No",
      },
    },

    procedures: {
      "PRP/GFC/iPRF": {
        done: true,
        sessions: "4-6",
        helped: "Yes",
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

    past_treatment_side_effects:
      "Yes",

    describe:
      "Scalp irritation after a previous topical treatment.",

    sample_type:
      "Saliva",

    consent:
      "Yes",
  };
}

function makeCompleteMalePatient(): IntakeState {
  return {
    currentAge: 42,
    sex: "Male",

    age_hair_loss_began:
      31,

    duration:
      "Over a year",

    family_history: [
      "Father had hair loss",
      "Siblings with thinning or baldness",
    ],

    pattern: [
      "Receding hairline",
      "Thinning at crown",
    ],

    diagnosed_conditions: [
      "None",
    ],

    menstrual_cycle:
      "Not applicable",

    pregnancy_related:
      "Not applicable",

    adult_acne_oily_skin:
      "No",

    excess_body_facial_hair:
      "No",

    past_6_months: [],

    habits: {
      smoking: "Yes",

      smoking_severity:
        "Moderate 5-10/day",

      alcohol: "Yes",

      hard_water: "No",

      hair_wash_frequency:
        "Daily",

      heating_tools_styling_chemicals:
        "No",

      salon_treatments:
        "No",

      salon_treatment_detail:
        "",
    },

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
        used: true,
        duration: ">6mo",
        helped: "Yes",
        side_effects: "No",
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

    past_treatment_side_effects:
      "No",

    describe: "",

    sample_type:
      "Blood",

    consent:
      "Yes",
  };
}

describe(
  "GenoRoot intake contract",
  () => {
    it(
      "initializes every required structured area",
      () => {
        expect(
          initialIntakeState
        ).toHaveProperty(
          "age_hair_loss_began"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "duration"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "family_history"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "pattern"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "diagnosed_conditions"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "menstrual_cycle"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "pregnancy_related"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "adult_acne_oily_skin"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "excess_body_facial_hair"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "past_6_months"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "habits"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "products"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "procedures"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "past_treatment_side_effects"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "sample_type"
        );

        expect(
          initialIntakeState
        ).toHaveProperty(
          "consent"
        );
      }
    );

    it(
      "contains every supplied product row",
      () => {
        expect(
          Object.keys(
            initialIntakeState.products
          )
        ).toEqual([
          "OTC/Medicated Shampoos",
          "Hair Oils/Serums",
          "Topical Minoxidil",
          "Oral Minoxidil",
          "Supplements",
        ]);
      }
    );

    it(
      "contains every supplied procedure row",
      () => {
        expect(
          Object.keys(
            initialIntakeState.procedures
          )
        ).toEqual([
          "PRP/GFC/iPRF",
          "Stem Cells/Exosomes",
          "Hair Transplant",
          "Other",
        ]);
      }
    );

    it(
      "treats the untouched intake as incomplete",
      () => {
        expect(
          isIntakeComplete(
            initialIntakeState
          )
        ).toBe(false);

        expect(
          getMissingRequiredAnswers(
            initialIntakeState
          ).length
        ).toBeGreaterThan(0);
      }
    );

    it(
      "accepts a fully completed female patient",
      () => {
        const patient =
          makeCompleteFemalePatient();

        expect(
          getMissingRequiredAnswers(
            patient
          )
        ).toEqual([]);

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toEqual([]);

        expect(
          isIntakeComplete(
            patient
          )
        ).toBe(true);
      }
    );

    it(
      "accepts a fully completed male patient with female-only fields marked not applicable",
      () => {
        const patient =
          makeCompleteMalePatient();

        expect(
          patient.menstrual_cycle
        ).toBe(
          "Not applicable"
        );

        expect(
          patient.pregnancy_related
        ).toBe(
          "Not applicable"
        );

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toEqual([]);

        expect(
          isIntakeComplete(
            patient
          )
        ).toBe(true);
      }
    );

    it(
      "allows Q10 past_6_months to be empty",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.past_6_months =
          [];

        expect(
          getMissingRequiredAnswers(
            patient
          )
        ).not.toContain(
          "Past 6 months"
        );

        expect(
          isIntakeComplete(
            patient
          )
        ).toBe(true);
      }
    );

    it(
      "requires smoking severity when smoking is Yes",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.habits.smoking =
          "Yes";

        patient.habits.smoking_severity =
          null;

        expect(
          getMissingRequiredAnswers(
            patient
          )
        ).toContain(
          "Smoking amount"
        );
      }
    );

    it(
      "rejects stale smoking severity when smoking is No",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.habits.smoking =
          "No";

        patient.habits.smoking_severity =
          "Severe >10/day";

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toContain(
          "Smoking severity must be null when smoking is No."
        );
      }
    );

    it(
      "requires salon treatment detail only when salon treatment is Yes",
      () => {
        const patient =
          makeCompleteFemalePatient();

        patient.habits.salon_treatments =
          "Yes";

        patient.habits.salon_treatment_detail =
          "";

        expect(
          getMissingRequiredAnswers(
            patient
          )
        ).toContain(
          "Salon treatment details"
        );

        patient.habits.salon_treatments =
          "No";

        patient.habits.salon_treatment_detail =
          "";

        expect(
          getMissingRequiredAnswers(
            patient
          )
        ).not.toContain(
          "Salon treatment details"
        );
      }
    );

    it(
      "rejects stale salon treatment detail when salon treatment is No",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.habits.salon_treatments =
          "No";

        patient.habits.salon_treatment_detail =
          "Keratin";

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toContain(
          "Salon treatment detail must be empty when salon treatments is No."
        );
      }
    );

    it(
      "requires all product follow-ups when a product is used",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.products[
          "Hair Oils/Serums"
        ] = {
          used: true,
          duration: null,
          helped: null,
          side_effects: null,
        };

        const missing =
          getMissingRequiredAnswers(
            patient
          );

        expect(
          missing
        ).toContain(
          "Hair Oils/Serums: duration"
        );

        expect(
          missing
        ).toContain(
          "Hair Oils/Serums: whether it helped"
        );

        expect(
          missing
        ).toContain(
          "Hair Oils/Serums: side effects"
        );
      }
    );

    it(
      "allows completely unused product rows",
      () => {
        const patient =
          makeCompleteMalePatient();

        const product =
          patient.products[
            "Hair Oils/Serums"
          ];

        expect(
          product
        ).toEqual({
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        });

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toEqual([]);
      }
    );

    it(
      "rejects follow-up values on an unused product",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.products[
          "Hair Oils/Serums"
        ] = {
          used: false,
          duration: ">6mo",
          helped: "Yes",
          side_effects: "No",
        };

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toContain(
          "Hair Oils/Serums contains follow-up answers even though used is false."
        );
      }
    );

    it(
      "requires procedure follow-ups when a procedure was done",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.procedures[
          "Hair Transplant"
        ] = {
          done: true,
          sessions: null,
          helped: null,
        };

        const missing =
          getMissingRequiredAnswers(
            patient
          );

        expect(
          missing
        ).toContain(
          "Hair Transplant: number of sessions"
        );

        expect(
          missing
        ).toContain(
          "Hair Transplant: whether it helped"
        );
      }
    );

    it(
      "rejects follow-up values on an undone procedure",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.procedures[
          "PRP/GFC/iPRF"
        ] = {
          done: false,
          sessions: "4-6",
          helped: "Yes",
        };

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toContain(
          "PRP/GFC/iPRF contains follow-up answers even though done is false."
        );
      }
    );

    it(
      "requires description when past treatment side effects is Yes",
      () => {
        const patient =
          makeCompleteFemalePatient();

        patient.past_treatment_side_effects =
          "Yes";

        patient.describe =
          "";

        expect(
          getMissingRequiredAnswers(
            patient
          )
        ).toContain(
          "Description of the treatment problem"
        );
      }
    );

    it(
      "rejects stale description when past treatment side effects is No",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.past_treatment_side_effects =
          "No";

        patient.describe =
          "Old value that should have been cleared";

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toContain(
          "Treatment problem description must be empty when past treatment side effects is No."
        );
      }
    );

    it(
      "rejects contradictory family history choices",
      () => {
        const patient =
          makeCompleteFemalePatient();

        patient.family_history =
          [
            "No known family history",
            "Father had hair loss",
          ];

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toContain(
          "No known family history cannot be combined with a positive family-history answer."
        );
      }
    );

    it(
      "rejects None combined with diagnosed conditions",
      () => {
        const patient =
          makeCompleteFemalePatient();

        patient.diagnosed_conditions =
          [
            "None",
            "Thyroid disorder",
          ];

        expect(
          validateIntakeConsistency(
            patient
          )
        ).toContain(
          "None cannot be combined with diagnosed health conditions."
        );
      }
    );

    it(
      "rejects incorrect female-only field values for a male patient",
      () => {
        const patient =
          makeCompleteMalePatient();

        patient.menstrual_cycle =
          "Regular";

        patient.pregnancy_related =
          "Currently pregnant";

        const errors =
          validateIntakeConsistency(
            patient
          );

        expect(
          errors
        ).toContain(
          "Male patients should have menstrual_cycle set to Not applicable."
        );

        expect(
          errors
        ).toContain(
          "Male patients should have pregnancy_related set to Not applicable."
        );
      }
    );

    it(
      "treats consent Yes as a valid completed response",
      () => {
        const patient =
          makeCompleteFemalePatient();

        patient.consent =
          "Yes";

        expect(
          isIntakeComplete(
            patient
          )
        ).toBe(true);
      }
    );

    it(
      "treats consent No as a valid completed response",
      () => {
        const patient =
          makeCompleteFemalePatient();

        patient.consent =
          "No";

        expect(
          isIntakeComplete(
            patient
          )
        ).toBe(true);

        expect(
          buildFinalOutput(
            patient
          ).consent
        ).toBe("No");
      }
    );

    it(
      "treats missing consent as incomplete",
      () => {
        const patient =
          makeCompleteFemalePatient();

        patient.consent =
          null;

        expect(
          getMissingRequiredAnswers(
            patient
          )
        ).toContain(
          "Consent response"
        );

        expect(
          isIntakeComplete(
            patient
          )
        ).toBe(false);
      }
    );

    it(
      "excludes helper currentAge and sex from final structured output",
      () => {
        const output =
          buildFinalOutput(
            makeCompleteFemalePatient()
          );

        expect(
          output
        ).not.toHaveProperty(
          "currentAge"
        );

        expect(
          output
        ).not.toHaveProperty(
          "sex"
        );
      }
    );

    it(
      "includes every required top-level output field",
      () => {
        const output =
          buildFinalOutput(
            makeCompleteFemalePatient()
          );

        expect(
          Object.keys(output)
        ).toEqual([
          "age_hair_loss_began",
          "duration",
          "family_history",
          "pattern",
          "diagnosed_conditions",
          "menstrual_cycle",
          "pregnancy_related",
          "adult_acne_oily_skin",
          "excess_body_facial_hair",
          "past_6_months",
          "habits",
          "products",
          "procedures",
          "past_treatment_side_effects",
          "describe",
          "sample_type",
          "consent",
        ]);
      }
    );

    it(
      "omits Q14 description when the parent answer is No",
      () => {
        const output =
          buildFinalOutput(
            makeCompleteMalePatient()
          );

        expect(
          output
        ).not.toHaveProperty(
          "describe"
        );
      }
    );

    it(
      "includes Q14 description when the parent answer is Yes",
      () => {
        const patient =
          makeCompleteFemalePatient();

        const output =
          buildFinalOutput(
            patient
          );

        expect(
          output
        ).toHaveProperty(
          "describe",
          "Scalp irritation after a previous topical treatment."
        );
      }
    );

    it(
      "preserves all nested product rows in final output",
      () => {
        const output =
          buildFinalOutput(
            makeCompleteFemalePatient()
          );

        expect(
          Object.keys(
            output.products
          )
        ).toHaveLength(5);

        expect(
          output.products[
            "Topical Minoxidil"
          ]
        ).toEqual({
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        });
      }
    );

    it(
      "preserves all nested procedure rows in final output",
      () => {
        const output =
          buildFinalOutput(
            makeCompleteFemalePatient()
          );

        expect(
          Object.keys(
            output.procedures
          )
        ).toHaveLength(4);

        expect(
          output.procedures[
            "Stem Cells/Exosomes"
          ]
        ).toEqual({
          done: false,
          sessions: null,
          helped: null,
        });
      }
    );
  }
);
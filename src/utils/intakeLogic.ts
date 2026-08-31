import type {
  IntakeState,
  ProcedureName,
  ProductName,
} from "../types/intake";

export const productNames: ProductName[] = [
  "OTC/Medicated Shampoos",
  "Hair Oils/Serums",
  "Topical Minoxidil",
  "Oral Minoxidil",
  "Supplements",
];

export const procedureNames: ProcedureName[] = [
  "PRP/GFC/iPRF",
  "Stem Cells/Exosomes",
  "Hair Transplant",
  "Other",
];

export function buildFinalOutput(
  intake: IntakeState
) {
  return {
    age_hair_loss_began:
      intake.age_hair_loss_began,

    duration:
      intake.duration,

    family_history:
      intake.family_history,

    pattern:
      intake.pattern,

    diagnosed_conditions:
      intake.diagnosed_conditions,

    menstrual_cycle:
      intake.menstrual_cycle,

    pregnancy_related:
      intake.pregnancy_related,

    adult_acne_oily_skin:
      intake.adult_acne_oily_skin,

    excess_body_facial_hair:
      intake.excess_body_facial_hair,

    past_6_months:
      intake.past_6_months,

    habits:
      intake.habits,

    products:
      intake.products,

    procedures:
      intake.procedures,

    past_treatment_side_effects:
      intake.past_treatment_side_effects,

    ...(intake.past_treatment_side_effects ===
    "Yes"
      ? {
          describe:
            intake.describe,
        }
      : {}),

    sample_type:
      intake.sample_type,

    consent:
      intake.consent,
  };
}

export function getMissingRequiredAnswers(
  intake: IntakeState
) {
  const missing: string[] = [];

  /*
   * Supporting patient information
   */
  if (intake.currentAge === null) {
    missing.push("Current age");
  }

  if (intake.sex === null) {
    missing.push(
      "Assigned sex at birth"
    );
  }

  /*
   * Section A
   */
  if (
    intake.age_hair_loss_began ===
    null
  ) {
    missing.push(
      "Age when you first noticed hair loss"
    );
  }

  if (intake.duration === null) {
    missing.push(
      "Duration of hair loss"
    );
  }

  if (
    intake.family_history.length ===
    0
  ) {
    missing.push(
      "Family history of hair loss"
    );
  }

  if (intake.pattern.length === 0) {
    missing.push(
      "Hair loss pattern"
    );
  }

  /*
   * Section B
   */
  if (
    intake.diagnosed_conditions
      .length === 0
  ) {
    missing.push(
      "Diagnosed health conditions"
    );
  }

  if (
    intake.sex === "Female" &&
    intake.menstrual_cycle === null
  ) {
    missing.push(
      "Menstrual cycle"
    );
  }

  if (
    intake.sex === "Female" &&
    intake.pregnancy_related ===
      null
  ) {
    missing.push(
      "Pregnancy / postpartum status"
    );
  }

  if (
    intake.adult_acne_oily_skin ===
    null
  ) {
    missing.push(
      "Adult acne / oily skin"
    );
  }

  if (
    intake.excess_body_facial_hair ===
    null
  ) {
    missing.push(
      "Excess body or facial hair"
    );
  }

  /*
   * Q10 deliberately may be [].
   * The supplied schema provides no
   * "None" option for this multi-select.
   */

  /*
   * Section C / Q11
   */
  if (
    intake.habits.smoking === null
  ) {
    missing.push("Smoking");
  }

  if (
    intake.habits.smoking ===
      "Yes" &&
    intake.habits
      .smoking_severity === null
  ) {
    missing.push(
      "Smoking amount"
    );
  }

  if (
    intake.habits.alcohol === null
  ) {
    missing.push("Alcohol use");
  }

  if (
    intake.habits.hard_water ===
    null
  ) {
    missing.push("Hard water");
  }

  if (
    intake.habits
      .hair_wash_frequency ===
    null
  ) {
    missing.push(
      "Hair wash frequency"
    );
  }

  if (
    intake.habits
      .heating_tools_styling_chemicals ===
    null
  ) {
    missing.push(
      "Heat styling / styling chemicals"
    );
  }

  if (
    intake.habits
      .salon_treatments === null
  ) {
    missing.push(
      "Salon treatments"
    );
  }

  if (
    intake.habits
      .salon_treatments === "Yes" &&
    intake.habits
      .salon_treatment_detail
      .trim().length === 0
  ) {
    missing.push(
      "Salon treatment details"
    );
  }

  /*
   * Q12 products
   */
  productNames.forEach(
    (product) => {
      const response =
        intake.products[product];

      if (!response.used) {
        return;
      }

      if (
        response.duration === null
      ) {
        missing.push(
          `${product}: duration`
        );
      }

      if (
        response.helped === null
      ) {
        missing.push(
          `${product}: whether it helped`
        );
      }

      if (
        response.side_effects ===
        null
      ) {
        missing.push(
          `${product}: side effects`
        );
      }
    }
  );

  /*
   * Q13 procedures
   */
  procedureNames.forEach(
    (procedure) => {
      const response =
        intake.procedures[
          procedure
        ];

      if (!response.done) {
        return;
      }

      if (
        response.sessions === null
      ) {
        missing.push(
          `${procedure}: number of sessions`
        );
      }

      if (
        response.helped === null
      ) {
        missing.push(
          `${procedure}: whether it helped`
        );
      }
    }
  );

  /*
   * Q14
   */
  if (
    intake.past_treatment_side_effects ===
    null
  ) {
    missing.push(
      "Past treatment side effects / poor response"
    );
  }

  if (
    intake.past_treatment_side_effects ===
      "Yes" &&
    intake.describe.trim().length ===
      0
  ) {
    missing.push(
      "Description of the treatment problem"
    );
  }

  /*
   * Q15
   */
  if (
    intake.sample_type === null
  ) {
    missing.push(
      "Preferred sample type"
    );
  }

  /*
   * Q16
   *
   * Both Yes and No are valid completed
   * answers. Only null is unanswered.
   */
  if (
    intake.consent === null
  ) {
    missing.push(
      "Consent response"
    );
  }

  return missing;
}

export function validateIntakeConsistency(
  intake: IntakeState
) {
  const errors: string[] = [];

  /*
   * Mutually exclusive choices
   */
  if (
    intake.family_history.includes(
      "No known family history"
    ) &&
    intake.family_history.length > 1
  ) {
    errors.push(
      "No known family history cannot be combined with a positive family-history answer."
    );
  }

  if (
    intake.diagnosed_conditions.includes(
      "None"
    ) &&
    intake.diagnosed_conditions.length >
      1
  ) {
    errors.push(
      "None cannot be combined with diagnosed health conditions."
    );
  }

  /*
   * Sex-specific answers
   */
  if (
    intake.sex === "Male" &&
    intake.menstrual_cycle !==
      "Not applicable"
  ) {
    errors.push(
      "Male patients should have menstrual_cycle set to Not applicable."
    );
  }

  if (
    intake.sex === "Male" &&
    intake.pregnancy_related !==
      "Not applicable"
  ) {
    errors.push(
      "Male patients should have pregnancy_related set to Not applicable."
    );
  }

  /*
   * Q11 parent/child consistency
   */
  if (
    intake.habits.smoking === "No" &&
    intake.habits
      .smoking_severity !== null
  ) {
    errors.push(
      "Smoking severity must be null when smoking is No."
    );
  }

  if (
    intake.habits.salon_treatments ===
      "No" &&
    intake.habits
      .salon_treatment_detail
      .trim() !== ""
  ) {
    errors.push(
      "Salon treatment detail must be empty when salon treatments is No."
    );
  }

  /*
   * Q12 product consistency
   */
  productNames.forEach(
    (product) => {
      const response =
        intake.products[product];

      if (
        !response.used &&
        (
          response.duration !== null ||
          response.helped !== null ||
          response.side_effects !== null
        )
      ) {
        errors.push(
          `${product} contains follow-up answers even though used is false.`
        );
      }
    }
  );

  /*
   * Q13 procedure consistency
   */
  procedureNames.forEach(
    (procedure) => {
      const response =
        intake.procedures[
          procedure
        ];

      if (
        !response.done &&
        (
          response.sessions !== null ||
          response.helped !== null
        )
      ) {
        errors.push(
          `${procedure} contains follow-up answers even though done is false.`
        );
      }
    }
  );

  /*
   * Q14 consistency
   */
  if (
    intake.past_treatment_side_effects ===
      "No" &&
    intake.describe.trim() !== ""
  ) {
    errors.push(
      "Treatment problem description must be empty when past treatment side effects is No."
    );
  }

  return errors;
}

export function isIntakeComplete(
  intake: IntakeState
) {
  return (
    getMissingRequiredAnswers(
      intake
    ).length === 0
  );
}
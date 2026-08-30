import type {
  IntakeState,
  ProcedureName,
  ProductName,
} from "../types/intake";

export type ValidationErrors = Record<string, string>;

/**
 * Validates the full patient state before final structured output.
 *
 * Conditional fields are required only when their parent answer
 * makes them relevant.
 */
export function validateIntake(
  intake: IntakeState
): ValidationErrors {
  const errors: ValidationErrors = {};

  validatePatientContext(intake, errors);
  validateSectionA(intake, errors);
  validateSectionB(intake, errors);
  validateSectionC(intake, errors);
  validateSectionD(intake, errors);
  validateSectionE(intake, errors);

  return errors;
}

export function isIntakeValid(intake: IntakeState): boolean {
  return Object.keys(validateIntake(intake)).length === 0;
}

/* -------------------------------------------------------------------------- */
/* Patient context                                                             */
/* -------------------------------------------------------------------------- */

function validatePatientContext(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  if (
    intake.currentAge === null ||
    !Number.isFinite(intake.currentAge) ||
    intake.currentAge < 0
  ) {
    errors.currentAge = "Enter your current age.";
  }

  if (intake.sex === null) {
    errors.sex = "Select Male or Female.";
  }
}

/* -------------------------------------------------------------------------- */
/* Section A · Personal & Family Hair Loss History                             */
/* -------------------------------------------------------------------------- */

function validateSectionA(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  if (
    intake.age_hair_loss_began === null ||
    !Number.isFinite(intake.age_hair_loss_began) ||
    intake.age_hair_loss_began < 0
  ) {
    errors.age_hair_loss_began =
      "Enter the age when you first noticed hair fall.";
  }

  if (
    intake.currentAge !== null &&
    intake.age_hair_loss_began !== null &&
    intake.age_hair_loss_began > intake.currentAge
  ) {
    errors.age_hair_loss_began =
      "Hair-loss onset age cannot be greater than current age.";
  }

  if (intake.duration === null) {
    errors.duration = "Select how long you have experienced hair fall.";
  }

  if (intake.family_history.length === 0) {
    errors.family_history = "Select at least one family-history answer.";
  }

  // "No known family history" cannot coexist with known affected relatives.
  if (
    intake.family_history.includes("No known family history") &&
    intake.family_history.length > 1
  ) {
    errors.family_history =
      "No known family history cannot be selected with another family-history answer.";
  }

  if (intake.pattern.length === 0) {
    errors.pattern = "Select at least one hair-loss pattern.";
  }
}

/* -------------------------------------------------------------------------- */
/* Section B · Hormonal & Health Influences                                    */
/* -------------------------------------------------------------------------- */

function validateSectionB(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  if (intake.diagnosed_conditions.length === 0) {
    errors.diagnosed_conditions =
      "Select the diagnosed conditions that apply.";
  }

  // "None" cannot coexist with a diagnosed condition.
  if (
    intake.diagnosed_conditions.includes("None") &&
    intake.diagnosed_conditions.length > 1
  ) {
    errors.diagnosed_conditions =
      "None cannot be selected with a diagnosed condition.";
  }

  if (intake.sex === "Female") {
    if (intake.menstrual_cycle === null) {
      errors.menstrual_cycle =
        "Select the menstrual-cycle option that applies.";
    }

    if (intake.pregnancy_related === null) {
      errors.pregnancy_related =
        "Select the pregnancy-related option that applies.";
    }
  }

  /**
   * Q6/Q7 are femaleOnly in the supplied schema.
   * Male patients skip the UI, but both values must still resolve
   * to "Not applicable" before final output.
   */
  if (
    intake.sex === "Male" &&
    intake.menstrual_cycle !== "Not applicable"
  ) {
    errors.menstrual_cycle =
      "Male patient context must map menstrual cycle to Not applicable.";
  }

  if (
    intake.sex === "Male" &&
    intake.pregnancy_related !== "Not applicable"
  ) {
    errors.pregnancy_related =
      "Male patient context must map pregnancy status to Not applicable.";
  }

  if (intake.adult_acne_oily_skin === null) {
    errors.adult_acne_oily_skin =
      "Answer the acne or oily-skin question.";
  }

  if (intake.excess_body_facial_hair === null) {
    errors.excess_body_facial_hair =
      "Answer the facial or body hair-growth question.";
  }
}

/* -------------------------------------------------------------------------- */
/* Section C · Lifestyle & Environmental Triggers                             */
/* -------------------------------------------------------------------------- */

function validateSectionC(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  /**
   * Q10 intentionally has no "None" value in Haiku's schema.
   * An empty array is therefore a valid answer.
   */

  if (intake.habits.smoking === null) {
    errors["habits.smoking"] = "Answer the smoking question.";
  }

  if (
    intake.habits.smoking === "Yes" &&
    intake.habits.smoking_severity === null
  ) {
    errors["habits.smoking_severity"] =
      "Select or provide the approximate cigarettes per day.";
  }

  // A non-smoker must not retain an old smoking-severity answer.
  if (
    intake.habits.smoking === "No" &&
    intake.habits.smoking_severity !== null
  ) {
    errors["habits.smoking_severity"] =
      "Smoking severity should be empty when smoking is No.";
  }

  if (intake.habits.alcohol === null) {
    errors["habits.alcohol"] = "Answer the alcohol question.";
  }

  if (intake.habits.hard_water === null) {
    errors["habits.hard_water"] = "Answer the hard-water question.";
  }

  if (intake.habits.hair_wash_frequency === null) {
    errors["habits.hair_wash_frequency"] =
      "Select your hair-wash frequency.";
  }

  if (intake.habits.heating_tools_styling_chemicals === null) {
    errors["habits.heating_tools_styling_chemicals"] =
      "Answer the heat-tools or styling-chemicals question.";
  }

  if (intake.habits.salon_treatments === null) {
    errors["habits.salon_treatments"] =
      "Answer the salon-treatment question.";
  }

  if (
    intake.habits.salon_treatments === "Yes" &&
    intake.habits.salon_treatment_detail.trim() === ""
  ) {
    errors["habits.salon_treatment_detail"] =
      "Tell us which salon treatment you had.";
  }

  // A No answer should not retain old conditional text.
  if (
    intake.habits.salon_treatments === "No" &&
    intake.habits.salon_treatment_detail.trim() !== ""
  ) {
    errors["habits.salon_treatment_detail"] =
      "Salon-treatment detail should be empty when the answer is No.";
  }
}

/* -------------------------------------------------------------------------- */
/* Section D · Current Hair Care & Treatments                                  */
/* -------------------------------------------------------------------------- */

function validateSectionD(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  validateProducts(intake, errors);
  validateProcedures(intake, errors);

  if (intake.past_treatment_side_effects === null) {
    errors.past_treatment_side_effects =
      "Answer the past-treatment response question.";
  }

  if (
    intake.past_treatment_side_effects === "Yes" &&
    intake.describe.trim() === ""
  ) {
    errors.describe = "Tell us what happened with the past treatment.";
  }

  if (
    intake.past_treatment_side_effects === "No" &&
    intake.describe.trim() !== ""
  ) {
    errors.describe =
      "Past-treatment description should be empty when the answer is No.";
  }
}

function validateProducts(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  const products = Object.entries(intake.products) as [
    ProductName,
    IntakeState["products"][ProductName],
  ][];

  for (const [productName, response] of products) {
    if (!response.used) {
      /**
       * Unselected Q12 rows still exist in the final table as used:false,
       * but their follow-ups should remain empty.
       */
      if (
        response.duration !== null ||
        response.helped !== null ||
        response.side_effects !== null
      ) {
        errors[`products.${productName}`] =
          "Unused products should not contain follow-up answers.";
      }

      continue;
    }

    if (response.duration === null) {
      errors[`products.${productName}.duration`] =
        `Select how long ${productName} was used.`;
    }

    if (response.helped === null) {
      errors[`products.${productName}.helped`] =
        `Answer whether ${productName} helped.`;
    }

    if (response.side_effects === null) {
      errors[`products.${productName}.side_effects`] =
        `Answer whether ${productName} caused side effects.`;
    }
  }
}

function validateProcedures(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  const procedures = Object.entries(intake.procedures) as [
    ProcedureName,
    IntakeState["procedures"][ProcedureName],
  ][];

  for (const [procedureName, response] of procedures) {
    if (!response.done) {
      /**
       * Unselected Q13 rows remain in the final table as done:false.
       */
      if (
        response.sessions !== null ||
        response.helped !== null
      ) {
        errors[`procedures.${procedureName}`] =
          "Procedures not done should not contain follow-up answers.";
      }

      continue;
    }

    if (response.sessions === null) {
      errors[`procedures.${procedureName}.sessions`] =
        `Select the number of sessions for ${procedureName}.`;
    }

    if (response.helped === null) {
      errors[`procedures.${procedureName}.helped`] =
        `Answer whether ${procedureName} helped.`;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Section E · Sample Collection & Consent                                     */
/* -------------------------------------------------------------------------- */

function validateSectionE(
  intake: IntakeState,
  errors: ValidationErrors
): void {
  if (intake.sample_type === null) {
    errors.sample_type = "Select your preferred sample type.";
  }

  /**
   * Both Yes and No are valid consent answers.
   * The only invalid state is leaving consent unanswered.
   */
  if (intake.consent === null) {
    errors.consent = "Please make an explicit consent selection.";
  }
}
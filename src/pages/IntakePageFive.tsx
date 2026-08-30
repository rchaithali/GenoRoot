import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useIntake } from "../context/useIntake";

import type {
  ProductName,
  ProcedureName,
  SampleType,
} from "../types/intake";

import "./intakePageFive.css";

interface IntakePageFiveProps {
  onBack: () => void;
}

const sampleTypes: SampleType[] = [
  "Saliva",
  "Blood",
  "Either",
];

const productNames: ProductName[] = [
  "OTC/Medicated Shampoos",
  "Hair Oils/Serums",
  "Topical Minoxidil",
  "Oral Minoxidil",
  "Supplements",
];

const procedureNames: ProcedureName[] = [
  "PRP/GFC/iPRF",
  "Stem Cells/Exosomes",
  "Hair Transplant",
  "Other",
];

function IntakePageFive({
  onBack,
}: IntakePageFiveProps) {
  const {
    intake,
    updateField,
  } = useIntake();

  const [showReview, setShowReview] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [
    attemptedSubmit,
    setAttemptedSubmit,
  ] = useState(false);

  const finalOutput = useMemo(
    () => ({
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
    }),
    [intake]
  );

  const missingRequiredAnswers =
    useMemo(() => {
      const missing: string[] = [];

      /*
       * Basic information
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
       * Section C
       *
       * past_6_months can legitimately
       * be empty if none apply.
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
       * Section D products.
       *
       * No selected products is allowed.
       * If selected, all follow-ups
       * must be completed.
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
       * Section D procedures.
       *
       * No selected procedures is allowed.
       * If selected, all follow-ups
       * must be completed.
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
       * Q16 is explicit.
       */
      if (intake.consent === null) {
        missing.push(
          "Consent response"
        );
      }

      return missing;
    }, [intake]);

  const formComplete =
    missingRequiredAnswers.length ===
    0;

  const canSubmit =
    formComplete &&
    intake.consent === "Yes";

  function handleSubmit() {
    setAttemptedSubmit(true);

    if (!formComplete) {
      return;
    }

    if (intake.consent !== "Yes") {
      return;
    }

    console.log(
      "GenoRoot final intake output:",
      finalOutput
    );

    setShowReview(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="intake-page-five">
        <div className="page-five-progress">
          <div className="page-five-progress__fill" />
        </div>

        <header className="page-five-header">
          <div className="page-five-header__inner">
            <div className="page-five-brand">
              GenoRoot
            </div>

            <div className="page-five-patient-label">
              Patient Intake
            </div>
          </div>
        </header>

        <main className="submission-success">
          <div className="success-icon">
            ✓
          </div>

          <h1>
            Your intake is complete.
          </h1>

          <p>
            Thank you. Your responses have
            been submitted successfully.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="intake-page-five">
      <div className="page-five-progress">
        <div className="page-five-progress__fill" />
      </div>

      <header className="page-five-header">
        <div className="page-five-header__inner">
          <div className="page-five-brand">
            GenoRoot
          </div>

          <div className="page-five-patient-label">
            Patient Intake
          </div>
        </div>
      </header>

      <main className="page-five-content">
        <div className="page-five-heading">
          <span className="page-five-eyebrow">
            Section E
          </span>

          <h1>
            Sample Collection &amp; Consent
          </h1>

          <p>
            One final step before completing
            your intake.
          </p>
        </div>

        <div className="page-five-card">
          <section className="final-question-section">
            <div className="final-question-heading">
              Preferred Sample Type
            </div>

            <p className="final-question-copy">
              How would you prefer to provide
              your genetic sample?
            </p>

            <div className="sample-grid">
              {sampleTypes.map(
                (sample) => (
                  <button
                    key={sample}
                    type="button"
                    className={`sample-choice ${
                      intake.sample_type ===
                      sample
                        ? "sample-choice--selected"
                        : ""
                    }`}
                    onClick={() =>
                      updateField(
                        "sample_type",
                        sample
                      )
                    }
                  >
                    {sample}

                    {intake.sample_type ===
                      sample && (
                      <span className="choice-check">
                        ✓
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
          </section>

          <div className="page-five-divider" />

          <section className="final-question-section">
            <div className="final-question-heading">
              Consent to Sample Collection
              and Genetic Analysis
            </div>

            <p className="consent-question">
              Do you consent to the collection
              of the sample you selected above
              and its use for genetic
              analysis?
            </p>

            <div className="consent-grid">
              <ConsentChoice
                selected={
                  intake.consent === "Yes"
                }
                icon="✓"
                label="Yes, I consent"
                onClick={() =>
                  updateField(
                    "consent",
                    "Yes"
                  )
                }
              />

              <ConsentChoice
                selected={
                  intake.consent === "No"
                }
                icon="×"
                label="No, I do not consent"
                negative
                onClick={() =>
                  updateField(
                    "consent",
                    "No"
                  )
                }
              />
            </div>
          </section>
        </div>

        {attemptedSubmit &&
          !formComplete && (
            <div className="missing-answer-card">
              <strong>
                Please complete these answers
                before submitting:
              </strong>

              <ul>
                {missingRequiredAnswers.map(
                  (item) => (
                    <li key={item}>
                      {item}
                    </li>
                  )
                )}
              </ul>

              <p>
                Use Back to return to the
                relevant section, then come
                back here to submit.
              </p>
            </div>
          )}

        {attemptedSubmit &&
          formComplete &&
          intake.consent === "No" && (
            <div className="missing-answer-card">
              <strong>
                Consent is required to submit
                this intake.
              </strong>

              <p>
                You selected “No, I do not
                consent”, so the intake cannot
                be submitted for sample
                collection and genetic
                analysis.
              </p>
            </div>
          )}

        <div className="final-actions">
          <button
            type="button"
            className="review-button"
            onClick={() =>
              setShowReview(true)
            }
          >
            ◉ Review Answers
          </button>

          <button
            type="button"
            className={`submit-button ${
              !canSubmit
                ? "submit-button--incomplete"
                : ""
            }`}
            onClick={handleSubmit}
          >
            Submit Intake →
          </button>
        </div>
      </main>

      <nav className="page-five-bottom-nav">
        <button
          type="button"
          className="page-five-back"
          onClick={onBack}
        >
          ← Back
        </button>
      </nav>

      {showReview && (
        <ReviewOverlay
          intake={intake}
          onClose={() =>
            setShowReview(false)
          }
        />
      )}
    </div>
  );
}

function ConsentChoice({
  selected,
  icon,
  label,
  negative = false,
  onClick,
}: {
  selected: boolean;
  icon: string;
  label: string;
  negative?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`consent-choice ${
        selected
          ? "consent-choice--selected"
          : ""
      }`}
      onClick={onClick}
    >
      <span
        className={`consent-icon ${
          negative
            ? "consent-icon--no"
            : "consent-icon--yes"
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}

function ReviewOverlay({
  intake,
  onClose,
}: {
  intake: ReturnType<
    typeof useIntake
  >["intake"];
  onClose: () => void;
}) {
  const selectedProducts =
    productNames.filter(
      (product) =>
        intake.products[product].used
    );

  const selectedProcedures =
    procedureNames.filter(
      (procedure) =>
        intake.procedures[
          procedure
        ].done
    );

  function displayValue(
    value:
      | string
      | number
      | null
      | undefined
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not answered";
    }

    return String(value);
  }

  function displayList(
    values: string[]
  ) {
    return values.length
      ? values.join(", ")
      : "None selected";
  }

  return (
    <div className="review-overlay">
      <div className="review-dialog">
        <div className="review-header">
          <div className="review-title-block">
            <span className="review-eyebrow">
              Intake Review
            </span>

            <h2>
              Review your answers
            </h2>
          </div>

          <button
            type="button"
            className="review-close"
            onClick={onClose}
            aria-label="Close review"
          >
            ×
          </button>
        </div>

        <p className="review-intro">
          Check your answers before
          submitting. Close this review and
          go back if you want to edit
          anything.
        </p>

        <div className="patient-review-content">
          <ReviewSection title="Basic Information">
            <ReviewRow
              label="Current age"
              value={displayValue(
                intake.currentAge
              )}
            />

            <ReviewRow
              label="Assigned sex at birth"
              value={displayValue(
                intake.sex
              )}
            />
          </ReviewSection>

          <ReviewSection title="Personal & Family History">
            <ReviewRow
              label="Age hair loss began"
              value={displayValue(
                intake.age_hair_loss_began
              )}
            />

            <ReviewRow
              label="Duration"
              value={displayValue(
                intake.duration
              )}
            />

            <ReviewRow
              label="Family history"
              value={displayList(
                intake.family_history
              )}
            />

            <ReviewRow
              label="Hair loss pattern"
              value={displayList(
                intake.pattern
              )}
            />
          </ReviewSection>

          <ReviewSection title="Hormonal & Health">
            <ReviewRow
              label="Diagnosed conditions"
              value={displayList(
                intake.diagnosed_conditions
              )}
            />

            <ReviewRow
              label="Menstrual cycle"
              value={displayValue(
                intake.menstrual_cycle
              )}
            />

            <ReviewRow
              label="Pregnancy / postpartum"
              value={displayValue(
                intake.pregnancy_related
              )}
            />

            <ReviewRow
              label="Adult acne / oily skin"
              value={displayValue(
                intake.adult_acne_oily_skin
              )}
            />

            <ReviewRow
              label="Excess body / facial hair"
              value={displayValue(
                intake.excess_body_facial_hair
              )}
            />
          </ReviewSection>

          <ReviewSection title="Lifestyle & Environmental">
            <ReviewRow
              label="Past 6 months"
              value={displayList(
                intake.past_6_months
              )}
            />

            <ReviewRow
              label="Smoking"
              value={displayValue(
                intake.habits.smoking
              )}
            />

            {intake.habits.smoking ===
              "Yes" && (
              <ReviewRow
                label="Smoking amount"
                value={displayValue(
                  intake.habits
                    .smoking_severity
                )}
              />
            )}

            <ReviewRow
              label="Alcohol"
              value={displayValue(
                intake.habits.alcohol
              )}
            />

            <ReviewRow
              label="Hard water"
              value={displayValue(
                intake.habits.hard_water
              )}
            />

            <ReviewRow
              label="Hair wash frequency"
              value={displayValue(
                intake.habits
                  .hair_wash_frequency
              )}
            />

            <ReviewRow
              label="Heat styling / chemicals"
              value={displayValue(
                intake.habits
                  .heating_tools_styling_chemicals
              )}
            />

            <ReviewRow
              label="Salon treatments"
              value={displayValue(
                intake.habits
                  .salon_treatments
              )}
            />

            {intake.habits
              .salon_treatments ===
              "Yes" && (
              <ReviewRow
                label="Salon treatment details"
                value={displayValue(
                  intake.habits
                    .salon_treatment_detail
                )}
              />
            )}
          </ReviewSection>

          <ReviewSection title="Current Hair Care & Treatments">
            {selectedProducts.length ===
            0 ? (
              <ReviewRow
                label="Products / medications"
                value="None selected"
              />
            ) : (
              selectedProducts.map(
                (product) => {
                  const response =
                    intake.products[
                      product
                    ];

                  return (
                    <div
                      key={product}
                      className="review-treatment-block"
                    >
                      <strong>
                        {product}
                      </strong>

                      <ReviewRow
                        label="Duration"
                        value={displayValue(
                          response.duration
                        )}
                      />

                      <ReviewRow
                        label="Helped"
                        value={displayValue(
                          response.helped
                        )}
                      />

                      <ReviewRow
                        label="Side effects"
                        value={displayValue(
                          response.side_effects
                        )}
                      />
                    </div>
                  );
                }
              )
            )}

            {selectedProcedures.length ===
            0 ? (
              <ReviewRow
                label="Procedures"
                value="None selected"
              />
            ) : (
              selectedProcedures.map(
                (procedure) => {
                  const response =
                    intake.procedures[
                      procedure
                    ];

                  return (
                    <div
                      key={procedure}
                      className="review-treatment-block"
                    >
                      <strong>
                        {procedure}
                      </strong>

                      <ReviewRow
                        label="Sessions"
                        value={displayValue(
                          response.sessions
                        )}
                      />

                      <ReviewRow
                        label="Helped"
                        value={displayValue(
                          response.helped
                        )}
                      />
                    </div>
                  );
                }
              )
            )}

            <ReviewRow
              label="Past treatment side effects / poor response"
              value={displayValue(
                intake.past_treatment_side_effects
              )}
            />

            {intake.past_treatment_side_effects ===
              "Yes" && (
              <ReviewRow
                label="What happened"
                value={displayValue(
                  intake.describe
                )}
              />
            )}
          </ReviewSection>

          <ReviewSection title="Sample Collection & Consent">
            <ReviewRow
              label="Preferred sample type"
              value={displayValue(
                intake.sample_type
              )}
            />

            <ReviewRow
              label="Consent"
              value={
                intake.consent === "Yes"
                  ? "Yes, I consent"
                  : intake.consent === "No"
                  ? "No, I do not consent"
                  : "Not answered"
              }
            />
          </ReviewSection>
        </div>

        <button
          type="button"
          className="review-done"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="review-section">
      <h3>{title}</h3>

      <div className="review-section-body">
        {children}
      </div>
    </section>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="review-row">
      <span className="review-row-label">
        {label}
      </span>

      <span className="review-row-value">
        {value}
      </span>
    </div>
  );
}

export default IntakePageFive;
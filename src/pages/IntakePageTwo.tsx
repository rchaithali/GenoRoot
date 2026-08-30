import { useIntake } from "../context/useIntake";

import type {
  DiagnosedCondition,
  MenstrualCycle,
  PregnancyRelated,
  YesNo,
} from "../types/intake";

import "./intakePageTwo.css";

interface IntakePageTwoProps {
  onBack: () => void;
  onContinue: () => void;
}

const diagnosedConditionOptions: {
  value: DiagnosedCondition;
  label: string;
}[] = [
  {
    value: "PCOS/PCOD",
    label: "PCOS/PCOD",
  },
  {
    value: "Thyroid disorder",
    label: "Thyroid disorder",
  },
  {
    value: "Diabetes",
    label: "Diabetes",
  },
  {
    value: "Autoimmune disease",
    label: "Autoimmune disease",
  },
  {
    value: "Anemia",
    label: "Anemia",
  },
  {
    value: "None",
    label: "None of the above",
  },
];

const menstrualCycleOptions: {
  value: MenstrualCycle;
  label: string;
  description: string;
}[] = [
  {
    value: "Regular",
    label: "Regular",
    description:
      "Usually comes around a similar time each month.",
  },
  {
    value: "Irregular",
    label: "Irregular",
    description:
      "Timing varies a lot, comes much earlier or later, you sometimes skip periods, or it’s been an unusually long time since your last period.",
  },
  {
    value: "Menopausal",
    label: "Menopausal",
    description:
      "If you know or believe you’ve reached menopause.",
  },
  {
    value: "Not applicable",
    label: "Not applicable",
    description:
      "My periods haven’t started yet.",
  },
];

const pregnancyOptions: {
  value: PregnancyRelated;
  label: string;
}[] = [
  {
    value: "Currently pregnant",
    label: "I’m currently pregnant",
  },
  {
    value: "Postpartum <1 year",
    label:
      "I gave birth within the past year",
  },
  {
    value: "Not applicable",
    label:
      "Neither of these applies to me",
  },
];

function IntakePageTwo({
  onBack,
  onContinue,
}: IntakePageTwoProps) {
  const { intake, updateField } =
    useIntake();

  const showFemaleOnlyQuestions =
    intake.sex === "Female";

  function toggleDiagnosedCondition(
    condition: DiagnosedCondition
  ) {
    const current =
      intake.diagnosed_conditions;

    if (condition === "None") {
      updateField(
        "diagnosed_conditions",
        current.includes("None")
          ? []
          : ["None"]
      );

      return;
    }

    const withoutNone =
      current.filter(
        (item) => item !== "None"
      );

    updateField(
      "diagnosed_conditions",
      withoutNone.includes(condition)
        ? withoutNone.filter(
            (item) =>
              item !== condition
          )
        : [
            ...withoutNone,
            condition,
          ]
    );
  }

  function selectMenstrualCycle(
    value: MenstrualCycle
  ) {
    updateField(
      "menstrual_cycle",
      value
    );
  }

  function selectPregnancyRelated(
    value: PregnancyRelated
  ) {
    updateField(
      "pregnancy_related",
      value
    );
  }

  function selectYesNo(
    field:
      | "adult_acne_oily_skin"
      | "excess_body_facial_hair",
    value: YesNo
  ) {
    updateField(field, value);
  }

  return (
    <div className="intake-page-two">
      <div className="page-two-progress">
        <div className="page-two-progress__fill" />
      </div>

      <header className="page-two-header">
        <div className="page-two-header__inner">
          <div className="page-two-brand">
            GenoRoot
          </div>

          <div className="page-two-patient-label">
            Patient Intake
          </div>
        </div>
      </header>

      <main className="page-two-content">
        <div className="page-two-heading">
          <span className="page-two-eyebrow">
            Section B
          </span>

          <h1>
            Hormonal &amp; Health Influences
          </h1>

          <p>
            A few questions about health and
            hormonal factors that may be
            relevant to your hair.
          </p>
        </div>

        <div className="page-two-stack">
          {/* Q5 */}
          <section className="page-two-card">
            <div className="page-two-question">
              Have you been diagnosed with
              any of the following?
            </div>

            <p className="page-two-helper">
              Select all that apply.
            </p>

            <div className="conditions-grid">
              {diagnosedConditionOptions.map(
                ({
                  value,
                  label,
                }) => {
                  const selected =
                    intake.diagnosed_conditions.includes(
                      value
                    );

                  const noneSelected =
                    intake.diagnosed_conditions.includes(
                      "None"
                    );

                  const conditionSelected =
                    intake.diagnosed_conditions.some(
                      (item) =>
                        item !== "None"
                    );

                  const disabled =
                    value === "None"
                      ? conditionSelected
                      : noneSelected;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        toggleDiagnosedCondition(
                          value
                        )
                      }
                      className={`page-two-checkbox-card ${
                        selected
                          ? "page-two-checkbox-card--selected"
                          : ""
                      } ${
                        disabled
                          ? "page-two-choice--disabled"
                          : ""
                      }`}
                    >
                      <span className="page-two-checkbox">
                        {selected && "✓"}
                      </span>

                      <span>
                        {label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* Q6 + Q7 only for Female */}
          {showFemaleOnlyQuestions && (
            <>
              {/* Q6 */}
              <section className="page-two-card">
                <div className="page-two-question">
                  How would you describe
                  your menstrual cycle?
                </div>

                <div className="cycle-stack">
                  {menstrualCycleOptions.map(
                    ({
                      value,
                      label,
                      description,
                    }) => {
                      const selected =
                        intake.menstrual_cycle ===
                        value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            selectMenstrualCycle(
                              value
                            )
                          }
                          className={`cycle-card ${
                            selected
                              ? "page-two-radio-card--selected"
                              : ""
                          }`}
                        >
                          <span
                            className={`page-two-radio ${
                              selected
                                ? "page-two-radio--selected"
                                : ""
                            }`}
                          />

                          <span className="cycle-copy">
                            <strong>
                              {label}
                            </strong>

                            <span>
                              {
                                description
                              }
                            </span>
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </section>

              {/* Q7 */}
              <section className="page-two-card">
                <div className="page-two-question">
                  Does either of these
                  apply to you right now?
                </div>

                <div className="pregnancy-grid">
                  {pregnancyOptions.map(
                    ({
                      value,
                      label,
                    }) => {
                      const selected =
                        intake.pregnancy_related ===
                        value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            selectPregnancyRelated(
                              value
                            )
                          }
                          className={`pregnancy-card ${
                            selected
                              ? "page-two-radio-card--selected"
                              : ""
                          }`}
                        >
                          {label}

                          {selected && (
                            <span className="page-two-card-check">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </section>
            </>
          )}

          {/* Q8 + Q9 */}
          <div className="binary-grid">
            <section className="page-two-card binary-card">
              <div className="page-two-question">
                As an adult, have you
                experienced frequent
                breakouts/acne or noticeably
                oily skin?
              </div>

              <p className="page-two-helper">
                Think about recurring breakouts
                or noticeably oily skin, rather
                than the occasional pimple.
              </p>

              <div className="yes-no-grid">
                {(["Yes", "No"] as YesNo[]).map(
                  (value) => {
                    const selected =
                      intake.adult_acne_oily_skin ===
                      value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          selectYesNo(
                            "adult_acne_oily_skin",
                            value
                          )
                        }
                        className={`yes-no-card ${
                          selected
                            ? "page-two-radio-card--selected"
                            : ""
                        }`}
                      >
                        {value}
                      </button>
                    );
                  }
                )}
              </div>
            </section>

            <section className="page-two-card binary-card">
              <div className="page-two-question">
                Have you noticed more,
                thicker, or new facial or body
                hair in areas where you
                previously had little?
              </div>

              <div className="binary-spacer" />

              <div className="yes-no-grid">
                {(["Yes", "No"] as YesNo[]).map(
                  (value) => {
                    const selected =
                      intake.excess_body_facial_hair ===
                      value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          selectYesNo(
                            "excess_body_facial_hair",
                            value
                          )
                        }
                        className={`yes-no-card ${
                          selected
                            ? "page-two-radio-card--selected"
                            : ""
                        }`}
                      >
                        {value}
                      </button>
                    );
                  }
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <nav className="page-two-bottom-nav">
        <button
          type="button"
          className="page-two-back"
          onClick={onBack}
        >
          <span>←</span>
          Back
        </button>

        <button
          type="button"
          className="page-two-continue"
          onClick={onContinue}
        >
          Continue
          <span>→</span>
        </button>
      </nav>
    </div>
  );
}

export default IntakePageTwo;
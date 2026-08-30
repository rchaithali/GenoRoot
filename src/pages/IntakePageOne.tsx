import {
  familyHistoryOptions,
  hairLossPatternOptions,
} from "../data/intakeOptions";
import { useIntake } from "../context/useIntake";
import { inferDurationFromAges } from "../utils/inference";

import type {
  Duration,
  FamilyHistory,
  HairLossPattern,
  Sex,
} from "../types/intake";

import "./intakePageOne.css";

interface IntakePageOneProps {
  onContinue: () => void;
}

/*
 * Temporary Q4 visuals.
 * The final pass will replace these with 6 male + 6 female
 * representative images without changing the stored schema values.
 */
const patternVisuals: Record<
  HairLossPattern,
  { image?: string; symbol?: string }
> = {
  "Receding hairline": {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3Jdi85slkB5ZrR-ks4YxCverPsCMZKYTOOifwTLJyDN3OUiYxLciEG50TIOCREqhXy_Kp207fnf6eJvpE5RO1VE3kAxiIZjafGuFs53qPcoLMGyyZ8IeU2Bbfbd9mWCtx8LOqy0Gg2DtSpg87lqKvykSjl0IwT7U6zlP0WZoZahX4Ov3HJxwQ6KyWJ-lFNvekkwv-F4pJoegYiyQEfhaUjyx3EyuQKCjqz6LDKHw2_qCQ1T2k6-qk",
  },
  "Thinning at crown": {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWuvnQsVo1wbCQXA-zA2E9hskzIZVqsZwWJLvYlPPaqhDiATDl3F46V9IvfVOg6Lk4sNBgwjIal0TDTtcHgaWQfYbPDv8XDEjRgwZ3sDVXcwYHeGM_cjEpURPy_s5uLkfn1oN_AH5rKNNrQXG-NycwHxqyDuhmcK1PsUAHwqY7niDTWmQM2Zsj9-p6_QAO89LIqa8UZBaWgluCb2cIUyk1QEHjSZqdq_R_HvCRQ4ZU6gmBeos1hq9Z",
  },
  "Widening part line": {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhrkqSGJY1KGrl-u8_EKl2IiLUBvUhvFn1hqECB8Yg8dw8dQwhvCfBZsXpmMoOm8u13taM65wwf-bNqSsWROkCPmKFxwiteqt2dhMB6KnpVa7OcNkm9YfVicXNHNoqOCVCJNz7VDKmjbJ0TCjVqV4F3OaEVEUqhRSNAeXILD6tSkQn9QkVf47q73VRbj2u9tl3MgXcb8Y68zlDlZPmoj-EaiA3K9ru4SdsJT3ui8aIlp9eZB2bn6D-",
  },
  "Diffuse thinning": {
    symbol: "◌",
  },
  "Patchy loss": {
    symbol: "•••",
  },
  "Sudden excessive shedding": {
    symbol: "◇",
  },
};

const durationOptions: Duration[] = [
  "Less than 6 months",
  "6-12 months",
  "Over a year",
];

function IntakePageOne({
  onContinue,
}: IntakePageOneProps) {
  const { intake, updateField } = useIntake();

  const durationInference = inferDurationFromAges(
    intake.currentAge,
    intake.age_hair_loss_began
  );

  function digitsOnly(value: string) {
    return value.replace(/\D/g, "");
  }

  function setCurrentAge(rawValue: string) {
    const value = digitsOnly(rawValue);

    if (value === "") {
      updateField("currentAge", null);
      updateField("age_hair_loss_began", null);
      updateField("duration", null);
      return;
    }

    const parsed = Number(value);

    if (
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > 120
    ) {
      return;
    }

    updateField("currentAge", parsed);

    if (
      intake.age_hair_loss_began !== null &&
      intake.age_hair_loss_began > parsed
    ) {
      updateField("age_hair_loss_began", null);
      updateField("duration", null);
    }
  }

  function setOnsetAge(rawValue: string) {
    const value = digitsOnly(rawValue);

    if (value === "") {
      updateField("age_hair_loss_began", null);
      updateField("duration", null);
      return;
    }

    const parsed = Number(value);

    const maximumAllowedAge =
      intake.currentAge ?? 120;

    if (
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > maximumAllowedAge
    ) {
      return;
    }

    updateField("age_hair_loss_began", parsed);

    /*
     * Q2 depends on Q1.
     * Clear an older duration answer whenever Q1 changes.
     */
    updateField("duration", null);
  }

  function selectSex(sex: Sex) {
    updateField("sex", sex);
  }

  function selectDuration(duration: Duration) {
    updateField("duration", duration);
  }

  function toggleFamilyHistory(
    value: FamilyHistory
  ) {
    const current = intake.family_history;

    if (value === "No known family history") {
      updateField(
        "family_history",
        current.includes(value)
          ? []
          : [value]
      );

      return;
    }

    const withoutNone = current.filter(
      (item) =>
        item !== "No known family history"
    );

    updateField(
      "family_history",
      withoutNone.includes(value)
        ? withoutNone.filter(
            (item) => item !== value
          )
        : [...withoutNone, value]
    );
  }

  function togglePattern(
    value: HairLossPattern
  ) {
    updateField(
      "pattern",
      intake.pattern.includes(value)
        ? intake.pattern.filter(
            (item) => item !== value
          )
        : [...intake.pattern, value]
    );
  }

  return (
    <div className="intake-page">
      <div className="top-progress">
        <div className="top-progress__fill" />
      </div>

      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand-wordmark">
            GenoRoot
          </div>

          <div className="patient-intake-label">
            Patient Intake
          </div>
        </div>
      </header>

      <main className="intake-content">
        {/* Context */}
        <section className="section-stack">
          <div className="section-heading">
            <span className="eyebrow">
              Context
            </span>

            <h1>
              Let's start with the basics.
            </h1>

            <p>
              This helps us personalize your
              assessment.
            </p>
          </div>

          {/* Current age */}
          <div className="question-card">
            <label
              className="large-question"
              htmlFor="current-age"
            >
              What is your current age?
            </label>

            <div className="number-field number-field--with-suffix number-field--centered">
              <input
                id="current-age"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                maxLength={3}
                placeholder="00"
                value={intake.currentAge ?? ""}
                onChange={(event) =>
                  setCurrentAge(
                    event.target.value
                  )
                }
              />

              <span>yrs</span>
            </div>
          </div>

          {/* Sex */}
          <div className="question-card">
            <div className="large-question">
              Assigned sex at birth
            </div>

            <div className="sex-grid">
              {(["Female", "Male"] as Sex[]).map(
                (sex) => {
                  const selected =
                    intake.sex === sex;

                  return (
                    <button
                      key={sex}
                      type="button"
                      className={`large-choice ${
                        selected
                          ? "large-choice--selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectSex(sex)
                      }
                    >
                      {sex}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* Section A */}
        <section className="section-stack section-a">
          <div className="section-heading section-heading--small">
            <span className="eyebrow">
              Section A
            </span>

            <h2>
              Personal &amp; Family History
            </h2>
          </div>

          {/* Q1 */}
          <div className="question-card">
            <label
              className="question-text"
              htmlFor="onset-age"
            >
              At what age did you first notice
              hair fall?
            </label>

            <p className="question-helper">
              An estimate is completely fine.
            </p>

            <div className="number-field number-field--centered">
              <input
                id="onset-age"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                maxLength={3}
                placeholder="00"
                value={
                  intake.age_hair_loss_began ??
                  ""
                }
                onChange={(event) =>
                  setOnsetAge(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          {/* Q2 */}
          <div className="question-card duration-card">
            {durationInference.suggested && (
              <div className="suggestion-label">
                Suggested from your earlier
                answer
              </div>
            )}

            <div className="question-text">
              How long have you been
              experiencing hair fall?
            </div>

            <div className="option-stack">
              {durationOptions.map(
                (duration) => {
                  const selected =
                    intake.duration === duration;

                  const unavailable =
                    intake.currentAge !== null &&
                    intake.age_hair_loss_began !==
                      null &&
                    !durationInference.possibleOptions.includes(
                      duration
                    );

                  return (
                    <button
                      key={duration}
                      type="button"
                      disabled={unavailable}
                      onClick={() =>
                        selectDuration(duration)
                      }
                      className={`radio-option ${
                        selected
                          ? "radio-option--selected"
                          : ""
                      } ${
                        unavailable
                          ? "radio-option--disabled"
                          : ""
                      }`}
                    >
                      <span className="fake-radio" />

                      <span>
                        {duration ===
                        "6-12 months"
                          ? "6–12 months"
                          : duration}
                      </span>

                      {selected && (
                        <span className="selection-check">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Q3 */}
          <div className="question-card">
            <div className="question-text">
              Does hair loss run in your
              family?{" "}
              <span className="question-note">
                (Select all that apply)
              </span>
            </div>

            <p className="question-helper">
              This can include noticeable
              thinning or baldness.
            </p>

            <div className="family-grid">
              {familyHistoryOptions.map(
                (option) => {
                  const selected =
                    intake.family_history.includes(
                      option
                    );

                  const noneSelected =
                    intake.family_history.includes(
                      "No known family history"
                    );

                  const relativeSelected =
                    intake.family_history.some(
                      (item) =>
                        item !==
                        "No known family history"
                    );

                  const disabled =
                    option ===
                    "No known family history"
                      ? relativeSelected
                      : noneSelected;

                  const label =
                    option ===
                    "Father had hair loss"
                      ? "Father"
                      : option ===
                        "Mother had hair loss"
                      ? "Mother"
                      : option ===
                        "Siblings with thinning or baldness"
                      ? "Sibling(s)"
                      : "No known family history";

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        toggleFamilyHistory(
                          option
                        )
                      }
                      className={`checkbox-option ${
                        selected
                          ? "checkbox-option--selected"
                          : ""
                      } ${
                        disabled
                          ? "checkbox-option--disabled"
                          : ""
                      }`}
                    >
                      <span className="fake-checkbox">
                        {selected && "✓"}
                      </span>

                      <span>{label}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Q4 */}
          <div className="question-card">
            <div className="question-text">
              Which of these looks most like
              what you've noticed?{" "}
              <span className="question-note">
                (Select all that apply)
              </span>
            </div>

            <div className="pattern-grid">
              {hairLossPatternOptions.map(
                (pattern) => {
                  const selected =
                    intake.pattern.includes(
                      pattern
                    );

                  const visual =
                    patternVisuals[pattern];

                  return (
                    <button
                      key={pattern}
                      type="button"
                      className={`pattern-card ${
                        selected
                          ? "pattern-card--selected"
                          : ""
                      }`}
                      onClick={() =>
                        togglePattern(pattern)
                      }
                    >
                      <div className="pattern-visual">
                        {visual.image ? (
                          <img
                            src={visual.image}
                            alt=""
                          />
                        ) : (
                          <span>
                            {visual.symbol}
                          </span>
                        )}
                      </div>

                      <span className="pattern-label">
                        {pattern ===
                        "Sudden excessive shedding"
                          ? "Sudden Shedding"
                          : pattern}
                      </span>

                      {selected && (
                        <span className="pattern-check">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </section>
      </main>

      <nav className="bottom-nav">
        <button
          type="button"
          className="back-button"
          disabled
        >
          <span>←</span>
          Back
        </button>

        <button
          type="button"
          className="continue-button"
          onClick={onContinue}
        >
          Continue
          <span>→</span>
        </button>
      </nav>
    </div>
  );
}

export default IntakePageOne;
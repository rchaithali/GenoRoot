import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useIntake } from "../context/useIntake";

import type {
  ProcedureName,
  ProcedureSessions,
  ProductDuration,
  ProductName,
  YesNo,
} from "../types/intake";

import "./intakePageFour.css";

interface IntakePageFourProps {
  onBack: () => void;
  onContinue: () => void;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onresult:
    | ((event: SpeechRecognitionEvent) => void)
    | null;

  onerror:
    | ((event: SpeechRecognitionErrorEvent) => void)
    | null;

  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const productNames: ProductName[] = [
  "OTC/Medicated Shampoos",
  "Hair Oils/Serums",
  "Topical Minoxidil",
  "Oral Minoxidil",
  "Supplements",
];

const productDurations: {
  value: ProductDuration;
  label: string;
}[] = [
  {
    value: "<3mo",
    label: "Less than 3 months",
  },
  {
    value: "3-6mo",
    label: "3–6 months",
  },
  {
    value: ">6mo",
    label: "More than 6 months",
  },
];

const procedureNames: ProcedureName[] = [
  "PRP/GFC/iPRF",
  "Stem Cells/Exosomes",
  "Hair Transplant",
  "Other",
];

const procedureSessions: {
  value: ProcedureSessions;
  label: string;
}[] = [
  {
    value: "1-3",
    label: "1–3",
  },
  {
    value: "4-6",
    label: "4–6",
  },
  {
    value: ">6",
    label: "More than 6",
  },
];

function IntakePageFour({
  onBack,
  onContinue,
}: IntakePageFourProps) {
  const {
    intake,
    updateProduct,
    updateProcedure,
    updateField,
  } = useIntake();

  const [
    descriptionListening,
    setDescriptionListening,
  ] = useState(false);

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );

  function toggleProduct(
    product: ProductName
  ) {
    updateProduct(product, {
      used:
        !intake.products[product]
          .used,
    });
  }

  function toggleProcedure(
    procedure: ProcedureName
  ) {
    if (procedure === "Other") {
      const selectingOther =
        !intake.procedures.Other.done;

      procedureNames.forEach(
        (name) => {
          updateProcedure(name, {
            done:
              name === "Other"
                ? selectingOther
                : false,
          });
        }
      );

      return;
    }

    if (
      intake.procedures.Other.done
    ) {
      updateProcedure("Other", {
        done: false,
      });
    }

    updateProcedure(procedure, {
      done:
        !intake.procedures[
          procedure
        ].done,
    });
  }

  function stopRecognition() {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped.
    }

    recognitionRef.current = null;
  }

  function startDescriptionSpeech() {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      return;
    }

    stopRecognition();

    const recognition =
      new Recognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognitionRef.current =
      recognition;

    let finalText = "";

    recognition.onresult = (
      event
    ) => {
      let interim = "";

      for (
        let i = 0;
        i < event.results.length;
        i += 1
      ) {
        const result =
          event.results[i];

        const text =
          result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalText += text;
        } else {
          interim += text;
        }
      }

      const visibleText =
        (finalText || interim).trim();

      if (visibleText) {
        updateField(
          "describe",
          visibleText
        );
      }

      if (finalText.trim()) {
        setDescriptionListening(
          false
        );
      }
    };

    recognition.onerror = () => {
      recognitionRef.current = null;

      setDescriptionListening(
        false
      );
    };

    recognition.onend = () => {
      recognitionRef.current = null;

      setDescriptionListening(
        false
      );
    };

    try {
      recognition.start();

      setDescriptionListening(
        true
      );
    } catch {
      setDescriptionListening(
        false
      );
    }
  }

  function stopDescriptionSpeech() {
    stopRecognition();

    setDescriptionListening(false);
  }

  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, []);

  return (
    <div className="intake-page-four">
      <div className="page-four-progress">
        <div className="page-four-progress__fill" />
      </div>

      <header className="page-four-header">
        <div className="page-four-header__inner">
          <div className="page-four-brand">
            GenoRoot
          </div>

          <div className="page-four-patient-label">
            Patient Intake
          </div>
        </div>
      </header>

      <main className="page-four-content">
        <div className="page-four-heading">
          <span className="page-four-eyebrow">
            Section D
          </span>

          <h1>
            Current Hair Care &amp; Treatments
          </h1>

          <p>
            Let’s review products and
            treatments you’re using now or
            have tried before.
          </p>
        </div>

        <div className="page-four-stack">
          <section className="page-four-card">
            <div className="page-four-question">
              Which of these hair products or
              medications are you currently
              using or have used?
            </div>

            <p className="page-four-helper">
              Select all that apply.
            </p>

            <div className="treatment-list">
              {productNames.map(
                (product) => {
                  const response =
                    intake.products[
                      product
                    ];

                  return (
                    <div
                      key={product}
                      className="treatment-item"
                    >
                      <button
                        type="button"
                        className={`treatment-selector ${
                          response.used
                            ? "treatment-selector--selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleProduct(
                            product
                          )
                        }
                      >
                        <span className="treatment-checkbox">
                          {response.used &&
                            "✓"}
                        </span>

                        <span>
                          {product}
                        </span>
                      </button>

                      {response.used && (
                        <div className="treatment-followup">
                          <FollowupLabel>
                            How long have you
                            used it?
                          </FollowupLabel>

                          <div className="three-option-grid">
                            {productDurations.map(
                              ({
                                value,
                                label,
                              }) => (
                                <ChoiceButton
                                  key={value}
                                  selected={
                                    response.duration ===
                                    value
                                  }
                                  onClick={() =>
                                    updateProduct(
                                      product,
                                      {
                                        duration:
                                          value,
                                      }
                                    )
                                  }
                                >
                                  {label}
                                </ChoiceButton>
                              )
                            )}
                          </div>

                          <div className="followup-two-column">
                            <div>
                              <FollowupLabel>
                                Did it help?
                              </FollowupLabel>

                              <YesNoButtons
                                value={
                                  response.helped
                                }
                                onSelect={(
                                  value
                                ) =>
                                  updateProduct(
                                    product,
                                    {
                                      helped:
                                        value,
                                    }
                                  )
                                }
                              />
                            </div>

                            <div>
                              <FollowupLabel>
                                Side effects?
                              </FollowupLabel>

                              <YesNoButtons
                                value={
                                  response.side_effects
                                }
                                onSelect={(
                                  value
                                ) =>
                                  updateProduct(
                                    product,
                                    {
                                      side_effects:
                                        value,
                                    }
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <section className="page-four-card">
            <div className="page-four-question">
              Which of these in-clinic hair
              treatments or procedures have
              you had?
            </div>

            <p className="page-four-helper">
              Select all that apply.
            </p>

            <div className="treatment-list">
              {procedureNames.map(
                (procedure) => {
                  const response =
                    intake.procedures[
                      procedure
                    ];

                  return (
                    <div
                      key={procedure}
                      className="treatment-item"
                    >
                      <button
                        type="button"
                        className={`treatment-selector ${
                          response.done
                            ? "treatment-selector--selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleProcedure(
                            procedure
                          )
                        }
                      >
                        <span className="treatment-checkbox">
                          {response.done &&
                            "✓"}
                        </span>

                        <span>
                          {procedure}
                        </span>
                      </button>

                      {response.done && (
                        <div className="treatment-followup">
                          <FollowupLabel>
                            How many sessions
                            have you had?
                          </FollowupLabel>

                          <div className="three-option-grid">
                            {procedureSessions.map(
                              ({
                                value,
                                label,
                              }) => (
                                <ChoiceButton
                                  key={value}
                                  selected={
                                    response.sessions ===
                                    value
                                  }
                                  onClick={() =>
                                    updateProcedure(
                                      procedure,
                                      {
                                        sessions:
                                          value,
                                      }
                                    )
                                  }
                                >
                                  {label}
                                </ChoiceButton>
                              )
                            )}
                          </div>

                          <FollowupLabel>
                            Did this treatment
                            help with your hair
                            concerns?
                          </FollowupLabel>

                          <YesNoButtons
                            value={
                              response.helped
                            }
                            onSelect={(
                              value
                            ) =>
                              updateProcedure(
                                procedure,
                                {
                                  helped:
                                    value,
                                }
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <section className="page-four-card">
            <div className="page-four-question">
              Have you experienced any side
              effects or felt that a past hair
              treatment did not work well for
              you?
            </div>

            <div className="side-effect-options">
              {(
                ["Yes", "No"] as YesNo[]
              ).map((value) => (
                <ChoiceButton
                  key={value}
                  selected={
                    intake.past_treatment_side_effects ===
                    value
                  }
                  onClick={() =>
                    updateField(
                      "past_treatment_side_effects",
                      value
                    )
                  }
                >
                  {value}
                </ChoiceButton>
              ))}
            </div>

            {intake.past_treatment_side_effects ===
              "Yes" && (
              <div className="description-block">
                <label htmlFor="treatment-description">
                  Please tell us what
                  happened.
                </label>

                <button
                  type="button"
                  className={`description-speak-button ${
                    descriptionListening
                      ? "description-speak-button--active"
                      : ""
                  }`}
                  onClick={() => {
                    if (
                      descriptionListening
                    ) {
                      stopDescriptionSpeech();
                    } else {
                      startDescriptionSpeech();
                    }
                  }}
                >
                  🎙{" "}
                  {descriptionListening
                    ? "Listening…"
                    : "Speak"}
                </button>

                {descriptionListening && (
                  <div className="description-listening">
                    <div className="description-wave">
                      {[0, 1, 2, 3, 4].map(
                        (bar) => (
                          <span
                            key={bar}
                          />
                        )
                      )}
                    </div>

                    <span>
                      Speak naturally. Your
                      words will appear below.
                    </span>
                  </div>
                )}

                <div className="type-answer-label">
                  Or type your answer
                </div>

                <textarea
                  id="treatment-description"
                  rows={4}
                  value={intake.describe}
                  onChange={(event) =>
                    updateField(
                      "describe",
                      event.target.value
                    )
                  }
                  placeholder="Describe your experience here..."
                />
              </div>
            )}
          </section>
        </div>
      </main>

      <nav className="page-four-bottom-nav">
        <button
          type="button"
          className="page-four-back"
          onClick={onBack}
        >
          <span>←</span>
          Back
        </button>

        <button
          type="button"
          className="page-four-continue"
          onClick={onContinue}
        >
          Continue
          <span>→</span>
        </button>
      </nav>
    </div>
  );
}

function FollowupLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="followup-label">
      {children}
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`followup-choice ${
        selected
          ? "followup-choice--selected"
          : ""
      }`}
    >
      {children}
    </button>
  );
}

function YesNoButtons({
  value,
  onSelect,
}: {
  value: YesNo | null;
  onSelect: (value: YesNo) => void;
}) {
  return (
    <div className="yes-no-grid-four">
      {(["Yes", "No"] as YesNo[]).map(
        (option) => (
          <ChoiceButton
            key={option}
            selected={
              value === option
            }
            onClick={() =>
              onSelect(option)
            }
          >
            {option}
          </ChoiceButton>
        )
      )}
    </div>
  );
}

export default IntakePageFour;
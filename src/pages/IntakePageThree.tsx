import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useIntake } from "../context/useIntake";

import type {
  HairWashFrequency,
  PastSixMonths,
  SmokingSeverity,
  YesNo,
} from "../types/intake";

import "./intakePageThree.css";

interface IntakePageThreeProps {
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

const pastSixMonthsOptions: PastSixMonths[] = [
  "Crash dieting or major weight loss",
  "High stress or emotional trauma",
  "Fever with illness (COVID, Dengue, Typhoid)",
  "Recent surgery",
  "Change in location/water/air quality",
];

const smokingSeverityOptions: SmokingSeverity[] = [
  "Mild <5/day",
  "Moderate 5-10/day",
  "Severe >10/day",
];

const hairWashOptions: HairWashFrequency[] = [
  "Daily",
  "Alternate Days",
  "Weekly",
];

type VoiceQuestionId =
  | "smoking"
  | "smoking_severity"
  | "alcohol"
  | "hard_water"
  | "hair_wash_frequency"
  | "heating_tools_styling_chemicals"
  | "salon_treatments"
  | "salon_treatment_detail";

const voiceQuestions: Record<
  VoiceQuestionId,
  string
> = {
  smoking: "Do you currently smoke?",
  smoking_severity:
    "About how many cigarettes do you smoke per day?",
  alcohol: "Do you drink alcohol?",
  hard_water:
    "Do you regularly wash your hair with hard water?",
  hair_wash_frequency:
    "How often do you wash your hair?",
  heating_tools_styling_chemicals:
    "Do you regularly use heat styling tools or styling chemicals on your hair?",
  salon_treatments:
    "Have you had salon treatments such as colouring, straightening, smoothing, or similar chemical treatments?",
  salon_treatment_detail:
    "What salon treatment did you have?",
};

function IntakePageThree({
  onBack,
  onContinue,
}: IntakePageThreeProps) {
  const {
    intake,
    updateField,
    updateHabit,
  } = useIntake();

  const [mode, setMode] = useState<
    "choose" | "manual" | "voice"
  >("choose");

  const [
    voiceQuestionId,
    setVoiceQuestionId,
  ] = useState<VoiceQuestionId>("smoking");

  const [voiceStatus, setVoiceStatus] =
    useState<
      "idle" | "speaking" | "listening" | "processing"
    >("idle");

  const [transcript, setTranscript] =
    useState("");

  const [voiceMessage, setVoiceMessage] =
    useState("");

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );

  function togglePastSixMonths(
    value: PastSixMonths
  ) {
    updateField(
      "past_6_months",
      intake.past_6_months.includes(value)
        ? intake.past_6_months.filter(
            (item) => item !== value
          )
        : [...intake.past_6_months, value]
    );
  }

  function normalizeSpeech(
    value: string
  ) {
    return value
      .toLowerCase()
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function inferYesNo(
    value: string
  ): YesNo | null {
    const text = normalizeSpeech(value);

    const compact = text.replace(
      /\s+/g,
      ""
    );

    const noAnswers = [
      "no",
      "nope",
      "nah",
      "nahi",
      "never",
      "notreally",
      "idon't",
      "idont",
      "idonot",
    ];

    const yesAnswers = [
      "yes",
      "yeah",
      "ya",
      "yah",
      "yep",
      "yup",
      "yea",
      "sure",
      "correct",
      "ido",
      "sometimes",
      "occasionally",
      "regularly",
    ];

    if (
      noAnswers.some(
        (answer) =>
          compact ===
            answer.replace(/\s+/g, "") ||
          compact.startsWith(
            answer.replace(/\s+/g, "")
          )
      )
    ) {
      return "No";
    }

    if (
      yesAnswers.some(
        (answer) =>
          compact ===
            answer.replace(/\s+/g, "") ||
          compact.startsWith(
            answer.replace(/\s+/g, "")
          )
      )
    ) {
      return "Yes";
    }

    if (
      text.includes("do not") ||
      text.includes("don't") ||
      text.includes("dont") ||
      text.includes("never")
    ) {
      return "No";
    }

    if (
      text.includes("yes") ||
      text.includes("yeah") ||
      text.includes("yep") ||
      text.includes("yup")
    ) {
      return "Yes";
    }

    return null;
  }

  function extractCount(
    value: string
  ): number | null {
    const text =
      normalizeSpeech(value);

    const digit =
      text.match(/\d+/);

    if (digit) {
      return Number(digit[0]);
    }

    const numberWords: Record<
      string,
      number
    > = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
    };

    for (const [
      word,
      number,
    ] of Object.entries(
      numberWords
    )) {
      if (
        text.split(" ").includes(word)
      ) {
        return number;
      }
    }

    return null;
  }

  function inferSmokingSeverity(
    value: string
  ): SmokingSeverity | null {
    const count =
      extractCount(value);

    if (count !== null) {
      if (count < 5) {
        return "Mild <5/day";
      }

      if (count <= 10) {
        return "Moderate 5-10/day";
      }

      return "Severe >10/day";
    }

    const text =
      normalizeSpeech(value);

    if (
      text.includes("less than five") ||
      text.includes("a few")
    ) {
      return "Mild <5/day";
    }

    if (
      text.includes("five to ten") ||
      text.includes("moderate")
    ) {
      return "Moderate 5-10/day";
    }

    if (
      text.includes("more than ten") ||
      text.includes("over ten") ||
      text.includes("heavy")
    ) {
      return "Severe >10/day";
    }

    return null;
  }

  function inferHairWashFrequency(
    value: string
  ): HairWashFrequency | null {
    const text =
      normalizeSpeech(value);

    if (
      text.includes("daily") ||
      text.includes("every day") ||
      text.includes("everyday")
    ) {
      return "Daily";
    }

    if (
      text.includes("alternate") ||
      text.includes("every other day") ||
      text.includes("every two days")
    ) {
      return "Alternate Days";
    }

    if (
      text.includes("weekly") ||
      text.includes("once a week") ||
      text.includes("twice a week") ||
      text.includes("three times a week")
    ) {
      return "Weekly";
    }

    return null;
  }

  function moveToQuestion(
    next: VoiceQuestionId
  ) {
    setVoiceQuestionId(next);
    setTranscript("");
    setVoiceMessage("");

    window.setTimeout(
      () => speakQuestion(next),
      80
    );
  }

  function finishVoiceSession() {
    stopRecognition();
    stopSpeaking();

    setVoiceStatus("idle");
    setMode("manual");

    setVoiceMessage(
      "Voice section complete. You can review or edit your answers below."
    );
  }

  function processVoiceAnswer(
    questionId: VoiceQuestionId,
    raw: string
  ) {
    const answer = raw.trim();

    if (!answer) {
      setVoiceStatus("idle");
      setVoiceMessage(
        "I didn't hear an answer. Tap the microphone to try again."
      );
      return;
    }

    setVoiceStatus("processing");

    if (questionId === "smoking") {
      const severity =
        inferSmokingSeverity(answer);

      if (severity) {
        updateHabit("smoking", "Yes");
        updateHabit(
          "smoking_severity",
          severity
        );
        moveToQuestion("alcohol");
        return;
      }

      const yesNo =
        inferYesNo(answer);

      if (yesNo === "No") {
        updateHabit("smoking", "No");
        updateHabit(
          "smoking_severity",
          null
        );
        moveToQuestion("alcohol");
        return;
      }

      if (yesNo === "Yes") {
        updateHabit("smoking", "Yes");
        moveToQuestion(
          "smoking_severity"
        );
        return;
      }
    }

    if (
      questionId ===
      "smoking_severity"
    ) {
      const severity =
        inferSmokingSeverity(answer);

      if (severity) {
        updateHabit(
          "smoking_severity",
          severity
        );
        moveToQuestion("alcohol");
        return;
      }
    }

    if (questionId === "alcohol") {
      const yesNo =
        inferYesNo(answer);

      if (yesNo) {
        updateHabit("alcohol", yesNo);
        moveToQuestion("hard_water");
        return;
      }
    }

    if (
      questionId === "hard_water"
    ) {
      const yesNo =
        inferYesNo(answer);

      if (yesNo) {
        updateHabit(
          "hard_water",
          yesNo
        );
        moveToQuestion(
          "hair_wash_frequency"
        );
        return;
      }
    }

    if (
      questionId ===
      "hair_wash_frequency"
    ) {
      const frequency =
        inferHairWashFrequency(
          answer
        );

      if (frequency) {
        updateHabit(
          "hair_wash_frequency",
          frequency
        );

        moveToQuestion(
          "heating_tools_styling_chemicals"
        );
        return;
      }
    }

    if (
      questionId ===
      "heating_tools_styling_chemicals"
    ) {
      const yesNo =
        inferYesNo(answer);

      if (yesNo) {
        updateHabit(
          "heating_tools_styling_chemicals",
          yesNo
        );

        moveToQuestion(
          "salon_treatments"
        );
        return;
      }
    }

    if (
      questionId ===
      "salon_treatments"
    ) {
      const yesNo =
        inferYesNo(answer);

      if (yesNo === "No") {
        updateHabit(
          "salon_treatments",
          "No"
        );

        updateHabit(
          "salon_treatment_detail",
          ""
        );

        finishVoiceSession();
        return;
      }

      if (yesNo === "Yes") {
        updateHabit(
          "salon_treatments",
          "Yes"
        );

        moveToQuestion(
          "salon_treatment_detail"
        );
        return;
      }
    }

    if (
      questionId ===
      "salon_treatment_detail"
    ) {
      if (answer.length >= 2) {
        updateHabit(
          "salon_treatment_detail",
          answer
        );

        finishVoiceSession();
        return;
      }
    }

    setVoiceStatus("idle");

    setVoiceMessage(
      "I couldn't confidently understand that. Tap the microphone to try again or switch to manual."
    );
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

  function startListening(
    questionId: VoiceQuestionId
  ) {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceStatus("idle");

      setVoiceMessage(
        "Voice input isn't supported in this browser. Please switch to manual."
      );
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
    let handled = false;

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

        const resultText =
          result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalText += resultText;
        } else {
          interim += resultText;
        }
      }

      setTranscript(
        (finalText || interim).trim()
      );

      if (
        finalText.trim() &&
        !handled
      ) {
        handled = true;

        processVoiceAnswer(
          questionId,
          finalText.trim()
        );
      }
    };

    recognition.onerror = (
      event
    ) => {
      recognitionRef.current = null;
      setVoiceStatus("idle");

      if (
        event.error ===
          "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        setVoiceMessage(
          "Microphone permission is required for voice answers."
        );
        return;
      }

      if (
        event.error === "no-speech"
      ) {
        setVoiceMessage(
          "I didn't hear anything. Tap the microphone and try again."
        );
        return;
      }

      setVoiceMessage(
        "I couldn't capture that clearly. Tap the microphone to try again."
      );
    };

    recognition.onend = () => {
      recognitionRef.current = null;

      if (!handled) {
        setVoiceStatus("idle");
      }
    };

    try {
      recognition.start();
      setVoiceStatus("listening");
    } catch {
      setVoiceStatus("idle");

      setVoiceMessage(
        "The microphone couldn't start. Tap it to try again."
      );
    }
  }

  function stopSpeaking() {
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }
  }

  function getPreferredVoice() {
    if (
      !(
        "speechSynthesis" in window
      )
    ) {
      return null;
    }

    const voices =
      window.speechSynthesis.getVoices();

    return (
      voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith("en-in")
      ) ??
      voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith("en-gb")
      ) ??
      voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith("en")
      ) ??
      null
    );
  }

  function speakQuestion(
    questionId: VoiceQuestionId
  ) {
    stopRecognition();
    stopSpeaking();

    setTranscript("");
    setVoiceMessage("");
    setVoiceStatus("speaking");

    if (
      !(
        "speechSynthesis" in window
      )
    ) {
      startListening(questionId);
      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(
        voiceQuestions[
          questionId
        ]
      );

    utterance.lang = "en-IN";
    utterance.rate = 1;

    const voice =
      getPreferredVoice();

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      startListening(questionId);
    };

    utterance.onerror = () => {
      startListening(questionId);
    };

    window.speechSynthesis.speak(
      utterance
    );
  }

  function firstUnansweredVoiceQuestion():
    | VoiceQuestionId
    | null {
    if (
      intake.habits.smoking ===
      null
    ) {
      return "smoking";
    }

    if (
      intake.habits.smoking ===
        "Yes" &&
      intake.habits
        .smoking_severity === null
    ) {
      return "smoking_severity";
    }

    if (
      intake.habits.alcohol ===
      null
    ) {
      return "alcohol";
    }

    if (
      intake.habits.hard_water ===
      null
    ) {
      return "hard_water";
    }

    if (
      intake.habits
        .hair_wash_frequency === null
    ) {
      return "hair_wash_frequency";
    }

    if (
      intake.habits
        .heating_tools_styling_chemicals ===
      null
    ) {
      return "heating_tools_styling_chemicals";
    }

    if (
      intake.habits
        .salon_treatments === null
    ) {
      return "salon_treatments";
    }

    if (
      intake.habits
        .salon_treatments ===
        "Yes" &&
      !intake.habits
        .salon_treatment_detail.trim()
    ) {
      return "salon_treatment_detail";
    }

    return null;
  }

  function startVoiceSession() {
    const first =
      firstUnansweredVoiceQuestion();

    if (!first) {
      setMode("manual");
      return;
    }

    setMode("voice");
    setVoiceQuestionId(first);

    window.setTimeout(
      () => speakQuestion(first),
      50
    );
  }

  function stopVoiceSession() {
    stopRecognition();
    stopSpeaking();

    setVoiceStatus("idle");
    setMode("manual");
  }

  useEffect(() => {
    return () => {
      stopRecognition();
      stopSpeaking();
    };
  }, []);

  return (
    <div className="intake-page-three">
      <div className="page-three-progress">
        <div className="page-three-progress__fill" />
      </div>

      <header className="page-three-header">
        <div className="page-three-header__inner">
          <div className="page-three-brand">
            GenoRoot
          </div>

          <div className="page-three-patient-label">
            Patient Intake
          </div>
        </div>
      </header>

      <main className="page-three-content">
        <div className="page-three-heading">
          <span className="page-three-eyebrow">
            Section C
          </span>

          <h1>
            Lifestyle &amp; Environmental
            Triggers
          </h1>

          <p>
            A few questions about recent
            changes, routines, and everyday
            factors that may affect your hair.
          </p>
        </div>

        <div className="page-three-stack">
          <section className="page-three-card">
            <div className="page-three-question">
              Have you experienced any of the
              following in the past 6 months?
            </div>

            <p className="page-three-helper">
              Select all that apply.
            </p>

            <div className="past-six-grid">
              {pastSixMonthsOptions.map(
                (option) => {
                  const selected =
                    intake.past_6_months.includes(
                      option
                    );

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        togglePastSixMonths(
                          option
                        )
                      }
                      className={`page-three-checkbox-card ${
                        selected
                          ? "page-three-checkbox-card--selected"
                          : ""
                      }`}
                    >
                      <span className="page-three-checkbox">
                        {selected && "✓"}
                      </span>

                      <span>{option}</span>
                    </button>
                  );
                }
              )}
            </div>
          </section>

          <section className="page-three-card habits-card">
            <div className="habits-header">
              <div className="habits-heading-copy">
                <h2 className="habits-title">
                  Everyday habits
                </h2>

                <p className="habits-description">
                  This covers smoking,
                  alcohol, water, washing,
                  styling, and salon
                  treatments.
                </p>
              </div>

              {mode === "manual" && (
                <button
                  type="button"
                  className="inline-mode-switch"
                  onClick={
                    startVoiceSession
                  }
                >
                  🎙 Switch to voice
                </button>
              )}
            </div>

            {mode === "choose" && (
              <div className="mode-selector">
                <p>
                  How would you prefer to
                  complete this section?
                </p>

                <div className="mode-grid">
                  <button
                    type="button"
                    className="mode-card mode-card--voice"
                    onClick={
                      startVoiceSession
                    }
                  >
                    <span className="mode-icon">
                      🎙
                    </span>

                    <strong>
                      Answer by Voice
                    </strong>

                    <span>
                      Guided questions, one at
                      a time
                    </span>
                  </button>

                  <button
                    type="button"
                    className="mode-card"
                    onClick={() =>
                      setMode("manual")
                    }
                  >
                    <span className="mode-icon">
                      ⌨
                    </span>

                    <strong>
                      Answer Manually
                    </strong>

                    <span>
                      Standard form fields
                    </span>
                  </button>
                </div>
              </div>
            )}

            {mode === "manual" && (
              <div className="manual-habits-form">
                <YesNoField
                  question="Do you currently smoke?"
                  value={
                    intake.habits.smoking
                  }
                  onSelect={(value) =>
                    updateHabit(
                      "smoking",
                      value
                    )
                  }
                />

                {intake.habits.smoking ===
                  "Yes" && (
                  <div className="habit-field">
                    <div className="habit-label">
                      About how much do you
                      smoke?
                    </div>

                    <div className="three-choice-grid">
                      {smokingSeverityOptions.map(
                        (value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateHabit(
                                "smoking_severity",
                                value
                              )
                            }
                            className={`habit-choice ${
                              intake.habits
                                .smoking_severity ===
                              value
                                ? "habit-choice--selected"
                                : ""
                            }`}
                          >
                            {value}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <YesNoField
                  question="Do you drink alcohol?"
                  value={
                    intake.habits.alcohol
                  }
                  onSelect={(value) =>
                    updateHabit(
                      "alcohol",
                      value
                    )
                  }
                />

                <YesNoField
                  question="Do you regularly wash your hair with hard water?"
                  value={
                    intake.habits.hard_water
                  }
                  onSelect={(value) =>
                    updateHabit(
                      "hard_water",
                      value
                    )
                  }
                />

                <div className="habit-field">
                  <div className="habit-label">
                    How often do you wash your
                    hair?
                  </div>

                  <div className="three-choice-grid">
                    {hairWashOptions.map(
                      (value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updateHabit(
                              "hair_wash_frequency",
                              value
                            )
                          }
                          className={`habit-choice ${
                            intake.habits
                              .hair_wash_frequency ===
                            value
                              ? "habit-choice--selected"
                              : ""
                          }`}
                        >
                          {value}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <YesNoField
                  question="Do you regularly use heat styling tools or styling chemicals?"
                  value={
                    intake.habits
                      .heating_tools_styling_chemicals
                  }
                  onSelect={(value) =>
                    updateHabit(
                      "heating_tools_styling_chemicals",
                      value
                    )
                  }
                />

                <YesNoField
                  question="Have you had salon treatments such as colouring, straightening, or smoothing?"
                  value={
                    intake.habits
                      .salon_treatments
                  }
                  onSelect={(value) =>
                    updateHabit(
                      "salon_treatments",
                      value
                    )
                  }
                />

                {intake.habits
                  .salon_treatments ===
                  "Yes" && (
                  <div className="habit-field">
                    <label
                      htmlFor="salon-detail"
                      className="habit-label"
                    >
                      What salon treatment did
                      you have?
                    </label>

                    <input
                      id="salon-detail"
                      type="text"
                      className="salon-detail-input"
                      value={
                        intake.habits
                          .salon_treatment_detail
                      }
                      onChange={(
                        event
                      ) =>
                        updateHabit(
                          "salon_treatment_detail",
                          event.target.value
                        )
                      }
                      placeholder="For example, colouring or keratin treatment"
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <nav className="page-three-bottom-nav">
        <button
          type="button"
          className="page-three-back"
          onClick={onBack}
        >
          <span>←</span>
          Back
        </button>

        <button
          type="button"
          className="page-three-continue"
          onClick={onContinue}
        >
          Continue
          <span>→</span>
        </button>
      </nav>

      {mode === "voice" && (
        <div className="voice-overlay">
          <div className="voice-overlay-actions">
            <button
              type="button"
              onClick={
                stopVoiceSession
              }
            >
              ⌨ Switch to manual
            </button>

            <button
              type="button"
              className="voice-close"
              onClick={
                stopVoiceSession
              }
            >
              ×
            </button>
          </div>

          <div className="voice-panel">
            <h2>
              {
                voiceQuestions[
                  voiceQuestionId
                ]
              }
            </h2>

            <div className="voice-control">
              <div
                className={`voice-orb ${
                  voiceStatus ===
                  "listening"
                    ? "voice-orb--active"
                    : ""
                }`}
              >
                <div className="voice-wave">
                  {[0, 1, 2, 3, 4].map(
                    (bar) => (
                      <span
                        key={bar}
                        className={`voice-wave-bar ${
                          voiceStatus ===
                          "listening"
                            ? "voice-wave-bar--active"
                            : ""
                        }`}
                      />
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="voice-mic"
                  onClick={() => {
                    if (
                      voiceStatus ===
                      "listening"
                    ) {
                      stopRecognition();
                      setVoiceStatus("idle");
                      return;
                    }

                    speakQuestion(
                      voiceQuestionId
                    );
                  }}
                >
                  🎙
                </button>
              </div>

              <div className="voice-status-label">
                {voiceStatus ===
                "speaking"
                  ? "Asking question…"
                  : voiceStatus ===
                    "listening"
                  ? "Listening…"
                  : voiceStatus ===
                    "processing"
                  ? "Got it…"
                  : "Tap to try again"}
              </div>
            </div>

            <div className="transcript-card">
              {transcript ? (
                <p className="transcript-value">
                  “{transcript}”
                </p>
              ) : (
                <p className="transcript-placeholder">
                  Your answer will appear
                  here.
                </p>
              )}
            </div>

            {voiceMessage && (
              <p className="voice-message">
                {voiceMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function YesNoField({
  question,
  value,
  onSelect,
}: {
  question: string;
  value: YesNo | null;
  onSelect: (value: YesNo) => void;
}) {
  return (
    <div className="habit-field">
      <div className="habit-label">
        {question}
      </div>

      <div className="two-choice-grid">
        {(["Yes", "No"] as YesNo[]).map(
          (option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                onSelect(option)
              }
              className={`habit-choice ${
                value === option
                  ? "habit-choice--selected"
                  : ""
              }`}
            >
              {option}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default IntakePageThree;
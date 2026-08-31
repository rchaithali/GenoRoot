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

const smokingSeverityLabels: Record<
  SmokingSeverity,
  string
> = {
  "Mild <5/day":
    "Less than 5 per day",
  "Moderate 5-10/day":
    "5–10 per day",
  "Severe >10/day":
    "More than 10 per day",
};

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
  smoking:
    "Do you currently smoke?",

  smoking_severity:
    "About how many cigarettes do you smoke per day?",

  alcohol:
    "Do you drink alcohol?",

  hard_water:
    "Do you regularly wash your hair with hard water?",

  hair_wash_frequency:
    "How often do you wash your hair? Daily, on alternate days, or weekly?",

  heating_tools_styling_chemicals:
    "Do you regularly use heat styling tools or styling chemicals on your hair?",

  salon_treatments:
    "Have you had salon treatments such as colouring, straightening, smoothing, keratin, or any similar chemical treatment?",

  salon_treatment_detail:
    "What salon treatment did you have? For example, colouring, straightening, smoothing, keratin, or something similar.",
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
  ] = useState<VoiceQuestionId>(
    "smoking"
  );

  const [
    voiceStatus,
    setVoiceStatus,
  ] = useState<
    | "idle"
    | "speaking"
    | "listening"
    | "processing"
  >("idle");

  const [
    transcript,
    setTranscript,
  ] = useState("");

  const [
    voiceMessage,
    setVoiceMessage,
  ] = useState("");

  const [
    showVoiceFallback,
    setShowVoiceFallback,
  ] = useState(false);

  const [
    fallbackText,
    setFallbackText,
  ] = useState("");

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );

  const retryCountRef =
    useRef(0);

  const showVoiceFallbackRef =
  useRef(false);

  const voiceSessionActiveRef =
    useRef(false);

  const sessionIdRef =
    useRef(0);

  const transitionTimeoutRef =
    useRef<number | null>(
      null
    );

  const questionTimeoutRef =
    useRef<number | null>(
      null
    );

  const speechWatchTimeoutRef =
    useRef<number | null>(
      null
    );

  function togglePastSixMonths(
    value: PastSixMonths
  ) {
    updateField(
      "past_6_months",
      intake.past_6_months.includes(
        value
      )
        ? intake.past_6_months.filter(
            (item) =>
              item !== value
          )
        : [
            ...intake.past_6_months,
            value,
          ]
    );
  }

  function normalizeSpeech(
    value: string
  ) {
    return value
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isUncertainAnswer(
    value: string
  ) {
    const text =
      normalizeSpeech(value);

    const uncertainPhrases = [
      "i dont know",
      "i do not know",
      "dont know",
      "do not know",
      "i dont remember",
      "i do not remember",
      "dont remember",
      "do not remember",
      "not sure",
      "im not sure",
      "unsure",
      "maybe",
      "probably",
      "cant say",
      "cannot say",
      "no idea",
    ];

    return uncertainPhrases.some(
      (phrase) =>
        text.includes(phrase)
    );
  }

  function inferYesNo(
    value: string
  ): YesNo | null {
    if (
      isUncertainAnswer(value)
    ) {
      return null;
    }

    const text =
      normalizeSpeech(value);

    /*
     * A clear spoken "no" at the
     * beginning counts as No.
     *
     * This fixes:
     * "no I don't"
     * "no I didn't"
     * "no I haven't"
     */
    if (
      /^no\b/.test(text) ||
      /^nope\b/.test(text) ||
      /^nah\b/.test(text)
    ) {
      return "No";
    }

    const negativePatterns = [
      /\bnever\b/,
      /\bnot really\b/,
      /\bnot at all\b/,

      /\bi havent\b/,
      /\bi have not\b/,

      /\bi didnt\b/,
      /\bi did not\b/,

      /\bi dont\b/,
      /\bi do not\b/,

      /\bhavent had\b/,
      /\bhave not had\b/,
      /\bnever had\b/,
    ];

    if (
      negativePatterns.some(
        (pattern) =>
          pattern.test(text)
      )
    ) {
      return "No";
    }

    if (
      /^yes\b/.test(text) ||
      /^yeah\b/.test(text) ||
      /^yep\b/.test(text) ||
      /^yup\b/.test(text) ||
      /^ya\b/.test(text) ||
      /\byes\b/.test(text) ||
      /\byeah\b/.test(text) ||
      /\byep\b/.test(text) ||
      /\byup\b/.test(text) ||
      /\bi do\b/.test(text) ||
      /\bof course\b/.test(text) ||
      /\bsure\b/.test(text) ||
      /\bdefinitely\b/.test(text) ||
      /\bsometimes\b/.test(text) ||
      /\boccasionally\b/.test(text) ||
      /\bregularly\b/.test(text)
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
      return Number(
        digit[0]
      );
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
        text
          .split(" ")
          .includes(word)
      ) {
        return number;
      }
    }

    return null;
  }

  function inferSmokingSeverity(
    value: string
  ): SmokingSeverity | null {
    if (
      isUncertainAnswer(value)
    ) {
      return null;
    }

    const text =
      normalizeSpeech(value);

    if (
      text.includes(
        "less than five"
      ) ||
      text.includes(
        "under five"
      ) ||
      text.includes(
        "fewer than five"
      )
    ) {
      return "Mild <5/day";
    }

    if (
      text.includes(
        "five to ten"
      ) ||
      text.includes(
        "between five and ten"
      ) ||
      text.includes(
        "5 to 10"
      )
    ) {
      return "Moderate 5-10/day";
    }

    if (
      text.includes(
        "more than ten"
      ) ||
      text.includes(
        "over ten"
      ) ||
      text.includes(
        "above ten"
      )
    ) {
      return "Severe >10/day";
    }

    const count =
      extractCount(value);

    if (
      count !== null
    ) {
      if (count < 5) {
        return "Mild <5/day";
      }

      if (count <= 10) {
        return "Moderate 5-10/day";
      }

      return "Severe >10/day";
    }

    return null;
  }

  function inferHairWashFrequency(
    value: string
  ): HairWashFrequency | null {
    if (
      isUncertainAnswer(value)
    ) {
      return null;
    }

    const text =
      normalizeSpeech(value);

    if (
      text.includes("daily") ||
      text.includes(
        "every day"
      ) ||
      text.includes(
        "everyday"
      ) ||
      text.includes(
        "once a day"
      )
    ) {
      return "Daily";
    }

    if (
      text.includes(
        "alternate"
      ) ||
      text.includes(
        "every other day"
      ) ||
      text.includes(
        "every two days"
      ) ||
      text.includes(
        "every 2 days"
      ) ||
      text.includes(
        "once in two days"
      )
    ) {
      return "Alternate Days";
    }

    if (
      text.includes(
        "weekly"
      ) ||
      text.includes(
        "once a week"
      ) ||
      text.includes(
        "once every week"
      ) ||
      text.includes(
        "twice a week"
      ) ||
      text.includes(
        "three times a week"
      ) ||
      text.includes(
        "four times a week"
      ) ||
      text.includes(
        "every week"
      )
    ) {
      return "Weekly";
    }

    /*
     * Output schema only supports:
     * Daily
     * Alternate Days
     * Weekly
     *
     * So:
     * every 3 days
     * every 4 days
     * every 5 days
     * every 6 days
     *
     * normalize to Weekly.
     */
    if (
      text.includes("day") ||
      text.includes("days")
    ) {
      const dayCount =
        extractCount(text);

      if (
        dayCount !== null
      ) {
        if (
          dayCount <= 1
        ) {
          return "Daily";
        }

        if (
          dayCount === 2
        ) {
          return "Alternate Days";
        }

        return "Weekly";
      }
    }

    return null;
  }

  function clearVoiceTimeouts() {
    if (
      transitionTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        transitionTimeoutRef.current
      );

      transitionTimeoutRef.current =
        null;
    }

    if (
      questionTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        questionTimeoutRef.current
      );

      questionTimeoutRef.current =
        null;
    }

    if (
      speechWatchTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        speechWatchTimeoutRef.current
      );

      speechWatchTimeoutRef.current =
        null;
    }
  }

  function stopRecognition() {
    const recognition =
      recognitionRef.current;

    recognitionRef.current =
      null;

    if (!recognition) {
      return;
    }

    try {
      recognition.onresult =
        null;

      recognition.onerror =
        null;

      recognition.onend =
        null;

      recognition.abort();
    } catch {
      // Already inactive.
    }
  }

  function stopSpeaking() {
    if (
      "speechSynthesis" in
      window
    ) {
      window.speechSynthesis.cancel();
    }

    if (
      speechWatchTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        speechWatchTimeoutRef.current
      );

      speechWatchTimeoutRef.current =
        null;
    }
  }

  function getPreferredVoice() {
    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return null;
    }

    const voices =
      window.speechSynthesis.getVoices();

    return (
      voices.find(
        (voice) =>
          voice.lang
            .toLowerCase()
            .startsWith(
              "en-in"
            )
      ) ??
      voices.find(
        (voice) =>
          voice.lang
            .toLowerCase()
            .startsWith(
              "en-gb"
            )
      ) ??
      voices.find(
        (voice) =>
          voice.lang
            .toLowerCase()
            .startsWith(
              "en"
            )
      ) ??
      null
    );
  }

  function isCurrentSession(
    sessionId: number
  ) {
    return (
      voiceSessionActiveRef.current &&
      sessionIdRef.current ===
        sessionId
    );
  }

  /*
   * Chrome sometimes fails to fire
   * utterance.onend reliably.
   *
   * This watcher gives us a second,
   * guarded way to detect that speech
   * actually stopped.
   */
  function waitForSpeechToFinish(
    sessionId: number,
    onFinished: () => void
  ) {
    let finished =
      false;

    function finishOnce() {
      if (finished) {
        return;
      }

      finished =
        true;

      if (
        !isCurrentSession(
          sessionId
        )
      ) {
        return;
      }

      if (
        speechWatchTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          speechWatchTimeoutRef.current
        );

        speechWatchTimeoutRef.current =
          null;
      }

      onFinished();
    }

    function watch() {
      if (
        !isCurrentSession(
          sessionId
        )
      ) {
        return;
      }

      if (
        !(
          "speechSynthesis" in
          window
        )
      ) {
        finishOnce();
        return;
      }

      if (
        !window.speechSynthesis.speaking &&
        !window.speechSynthesis.pending
      ) {
        finishOnce();
        return;
      }

      speechWatchTimeoutRef.current =
        window.setTimeout(
          watch,
          100
        );
    }

    speechWatchTimeoutRef.current =
      window.setTimeout(
        watch,
        150
      );

    return finishOnce;
  }

  function getFallbackSpeech(
    questionId: VoiceQuestionId
  ) {
    switch (
      questionId
    ) {
      case "smoking":
      case "alcohol":
      case "hard_water":
      case "heating_tools_styling_chemicals":
      case "salon_treatments":
        return "Please select Yes or No.";

      case "smoking_severity":
        return "Please select less than 5 per day, 5 to 10 per day, or more than 10 per day.";

      case "hair_wash_frequency":
        return "Please select Daily, Alternate Days, or Weekly.";

      case "salon_treatment_detail":
        return "Please type the salon treatment below. If you don't know or don't remember the name, you can enter that.";
    }
  }

  function speakAndListen(
    message: string,
    questionId: VoiceQuestionId
  ) {
    if (
      !voiceSessionActiveRef.current
    ) {
      return;
    }

    const sessionId =
      sessionIdRef.current;

    stopRecognition();

    stopSpeaking();

    setVoiceMessage(
      message
    );

    setVoiceStatus(
      "speaking"
    );

    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      setTranscript("");

      setVoiceMessage("");

      startListening(
        questionId
      );

      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(
        message
      );

    utterance.lang =
      "en-IN";

    utterance.rate =
      1;

    const voice =
      getPreferredVoice();

    if (voice) {
      utterance.voice =
        voice;
    }

    let resumed =
      false;

    function resumeListening() {
      if (
        resumed ||
        !isCurrentSession(
          sessionId
        )
      ) {
        return;
      }

      resumed =
        true;

      setTranscript("");

      setVoiceMessage("");

      startListening(
        questionId
      );
    }

    const finishWatcher =
      waitForSpeechToFinish(
        sessionId,
        resumeListening
      );

    utterance.onend =
      () => {
        finishWatcher();
      };

    utterance.onerror =
      () => {
        finishWatcher();
      };

    window.speechSynthesis.speak(
      utterance
    );
  }

  function showFallbackAndSpeak(
    questionId: VoiceQuestionId
  ) {
    if (
      !voiceSessionActiveRef.current
    ) {
      return;
    }

    const sessionId =
      sessionIdRef.current;

    stopRecognition();

    stopSpeaking();
    showVoiceFallbackRef.current =
  true;

    /*
     * Show choices immediately.
     */
    setShowVoiceFallback(
      true
    );

    const message =
      getFallbackSpeech(
        questionId
      );

    setVoiceMessage(
      message
    );

    setVoiceStatus(
      "speaking"
    );

    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      setVoiceStatus(
        "idle"
      );

      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(
        message
      );

    utterance.lang =
      "en-IN";

    utterance.rate =
      1;

    const voice =
      getPreferredVoice();

    if (voice) {
      utterance.voice =
        voice;
    }

    let finished =
      false;

    function finishFallbackSpeech() {
      if (
        finished ||
        !isCurrentSession(
          sessionId
        )
      ) {
        return;
      }

      finished =
        true;

      setVoiceStatus(
        "idle"
      );
    }

    const finishWatcher =
      waitForSpeechToFinish(
        sessionId,
        finishFallbackSpeech
      );

    utterance.onend =
      finishWatcher;

    utterance.onerror =
      finishWatcher;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function handleUnclearAnswer(
    questionId: VoiceQuestionId
  ) {
    if (
  !voiceSessionActiveRef.current ||
  showVoiceFallbackRef.current
) {
  return;
}

    retryCountRef.current +=
      1;

    /*
     * Failure 1:
     * automatic retry.
     */
    if (
      retryCountRef.current === 1
    ) {
      speakAndListen(
        "Sorry, I didn't catch that clearly. Please answer again.",
        questionId
      );

      return;
    }

    /*
     * Failure 2:
     * show fallback immediately.
     * No third recognition attempt.
     */
    showFallbackAndSpeak(
      questionId
    );
  }

  function resetRetryState() {
  retryCountRef.current =
    0;

  showVoiceFallbackRef.current =
    false;

  setShowVoiceFallback(
    false
  );

  setFallbackText("");

  setVoiceMessage("");
}

  function moveToQuestion(
    next: VoiceQuestionId
  ) {
    if (
      !voiceSessionActiveRef.current
    ) {
      return;
    }

    const sessionId =
      sessionIdRef.current;

    resetRetryState();

    clearVoiceTimeouts();

    /*
     * Keep recognized answer visible
     * briefly before moving.
     */
    transitionTimeoutRef.current =
      window.setTimeout(
        () => {
          if (
            !isCurrentSession(
              sessionId
            )
          ) {
            return;
          }

          setVoiceQuestionId(
            next
          );

          setTranscript("");

          setVoiceMessage("");

          questionTimeoutRef.current =
            window.setTimeout(
              () => {
                if (
                  !isCurrentSession(
                    sessionId
                  )
                ) {
                  return;
                }

                speakQuestion(
                  next
                );
              },
              50
            );
        },
        500
      );
  }

  function endVoiceSession() {
    voiceSessionActiveRef.current =
      false;

    sessionIdRef.current +=
      1;

    clearVoiceTimeouts();

    stopRecognition();

    stopSpeaking();

    retryCountRef.current =
      0;

    setVoiceStatus(
      "idle"
    );

    setTranscript("");

    setVoiceMessage("");

    setShowVoiceFallback(
      false
    );

    setFallbackText("");
  }

  function finishVoiceSession() {
    endVoiceSession();

    setMode(
      "manual"
    );
  }

  function processVoiceAnswer(
    questionId: VoiceQuestionId,
    raw: string
  ) {
    if (
      !voiceSessionActiveRef.current
    ) {
      return;
    }

    const answer =
      raw.trim();

    if (!answer) {
      handleUnclearAnswer(
        questionId
      );

      return;
    }

    /*
     * Final salon treatment detail
     * is free text.
     *
     * "I don't know"
     * and
     * "I don't remember"
     * are valid here.
     */
    if (
      questionId ===
      "salon_treatment_detail"
    ) {
      if (
        answer.length >= 2
      ) {
        updateHabit(
          "salon_treatment_detail",
          answer
        );

        finishVoiceSession();

        return;
      }

      handleUnclearAnswer(
        questionId
      );

      return;
    }

    /*
     * Closed questions:
     * uncertainty is not No.
     */
    if (
      isUncertainAnswer(
        answer
      )
    ) {
      handleUnclearAnswer(
        questionId
      );

      return;
    }

    setVoiceStatus(
      "processing"
    );

    if (
      questionId ===
      "smoking"
    ) {
      const yesNo =
        inferYesNo(answer);

      if (
        yesNo === "No"
      ) {
        updateHabit(
          "smoking",
          "No"
        );

        updateHabit(
          "smoking_severity",
          null
        );

        moveToQuestion(
          "alcohol"
        );

        return;
      }

      if (
        yesNo === "Yes"
      ) {
        updateHabit(
          "smoking",
          "Yes"
        );

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
        inferSmokingSeverity(
          answer
        );

      if (severity) {
        updateHabit(
          "smoking_severity",
          severity
        );

        moveToQuestion(
          "alcohol"
        );

        return;
      }
    }

    if (
      questionId ===
      "alcohol"
    ) {
      const yesNo =
        inferYesNo(answer);

      if (yesNo) {
        updateHabit(
          "alcohol",
          yesNo
        );

        moveToQuestion(
          "hard_water"
        );

        return;
      }
    }

    if (
      questionId ===
      "hard_water"
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

      if (
        yesNo === "No"
      ) {
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

      if (
        yesNo === "Yes"
      ) {
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

    handleUnclearAnswer(
      questionId
    );
  }

  function startListening(
    questionId: VoiceQuestionId
  ) {
    if (
  !voiceSessionActiveRef.current ||
  showVoiceFallbackRef.current
) {
  return;
}

    /*
     * Local typing only.
     * Avoids duplicate global declarations
     * with Page 4.
     */
    const speechWindow =
      window as Window & {
        SpeechRecognition?:
          SpeechRecognitionConstructor;

        webkitSpeechRecognition?:
          SpeechRecognitionConstructor;
      };

    const Recognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      showFallbackAndSpeak(
        questionId
      );

      return;
    }

    stopRecognition();

    if (
      !voiceSessionActiveRef.current
    ) {
      return;
    }

    const recognition =
      new Recognition();

    recognition.lang =
      "en-IN";

    recognition.continuous =
      false;

    recognition.interimResults =
      true;

    recognitionRef.current =
      recognition;

    let finalText = "";
    let handled = false;
    let failed = false;

    recognition.onresult =
      (event) => {
        if (
          !voiceSessionActiveRef.current
        ) {
          return;
        }

        let interim = "";

        for (
          let i = 0;
          i <
          event.results.length;
          i += 1
        ) {
          const result =
            event.results[i];

          const resultText =
            result[0]
              ?.transcript ??
            "";

          if (
            result.isFinal
          ) {
            finalText +=
              resultText;
          } else {
            interim +=
              resultText;
          }
        }

        const visibleText =
          (
            finalText ||
            interim
          ).trim();

        setTranscript(
          visibleText
        );

        if (
          finalText.trim() &&
          !handled
        ) {
          handled =
            true;

          processVoiceAnswer(
            questionId,
            finalText.trim()
          );
        }
      };

    recognition.onerror =
      (event) => {
        failed =
          true;

        if (
          recognitionRef.current ===
          recognition
        ) {
          recognitionRef.current =
            null;
        }

        if (
          !voiceSessionActiveRef.current ||
          event.error ===
            "aborted"
        ) {
          return;
        }

        if (
          event.error ===
            "not-allowed" ||
          event.error ===
            "service-not-allowed"
        ) {
          setVoiceStatus(
            "idle"
          );

          setVoiceMessage(
            "Microphone permission is required for voice answers."
          );

          return;
        }

        handleUnclearAnswer(
          questionId
        );
      };

    recognition.onend =
      () => {
        if (
          recognitionRef.current ===
          recognition
        ) {
          recognitionRef.current =
            null;
        }

        if (
          !voiceSessionActiveRef.current
        ) {
          return;
        }

        if (failed) {
          return;
        }

        if (!handled) {
          handleUnclearAnswer(
            questionId
          );
        }
      };

    try {
      recognition.start();

      if (
        voiceSessionActiveRef.current
      ) {
        setVoiceStatus(
          "listening"
        );
      }
    } catch {
      if (
        recognitionRef.current ===
        recognition
      ) {
        recognitionRef.current =
          null;
      }

      if (
        voiceSessionActiveRef.current
      ) {
        handleUnclearAnswer(
          questionId
        );
      }
    }
  }

  function speakQuestion(
    questionId: VoiceQuestionId
  ) {
    if (
      !voiceSessionActiveRef.current
    ) {
      return;
    }

    const sessionId =
      sessionIdRef.current;

    stopRecognition();

    stopSpeaking();

    setTranscript("");

    setVoiceMessage("");

    setShowVoiceFallback(
      false
    );

    setVoiceStatus(
      "speaking"
    );

    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      startListening(
        questionId
      );

      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(
        voiceQuestions[
          questionId
        ]
      );

    utterance.lang =
      "en-IN";

    utterance.rate =
      1;

    const voice =
      getPreferredVoice();

    if (voice) {
      utterance.voice =
        voice;
    }

    let resumed =
      false;

    function resumeListening() {
      if (
        resumed ||
        !isCurrentSession(
          sessionId
        )
      ) {
        return;
      }

      resumed =
        true;

      startListening(
        questionId
      );
    }

    const finishWatcher =
      waitForSpeechToFinish(
        sessionId,
        resumeListening
      );

    utterance.onend =
      finishWatcher;

    utterance.onerror =
      finishWatcher;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function firstUnansweredVoiceQuestion():
    | VoiceQuestionId
    | null {
    if (
      intake.habits
        .smoking === null
    ) {
      return "smoking";
    }

    if (
      intake.habits
        .smoking === "Yes" &&
      intake.habits
        .smoking_severity ===
        null
    ) {
      return "smoking_severity";
    }

    if (
      intake.habits
        .alcohol === null
    ) {
      return "alcohol";
    }

    if (
      intake.habits
        .hard_water === null
    ) {
      return "hard_water";
    }

    if (
      intake.habits
        .hair_wash_frequency ===
        null
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
        .salon_treatments ===
        null
    ) {
      return "salon_treatments";
    }

    if (
      intake.habits
        .salon_treatments ===
        "Yes" &&
      !intake.habits
        .salon_treatment_detail
        .trim()
    ) {
      return "salon_treatment_detail";
    }

    return null;
  }

  function startVoiceSession() {
    const first =
      firstUnansweredVoiceQuestion();

    if (!first) {
      setMode(
        "manual"
      );

      return;
    }

    endVoiceSession();

    sessionIdRef.current +=
      1;

    voiceSessionActiveRef.current =
      true;

    retryCountRef.current =
      0;

    setMode(
      "voice"
    );

    setVoiceQuestionId(
      first
    );

    setTranscript("");

    setVoiceMessage("");

    setShowVoiceFallback(
      false
    );

    const sessionId =
      sessionIdRef.current;

    questionTimeoutRef.current =
      window.setTimeout(
        () => {
          if (
            !isCurrentSession(
              sessionId
            )
          ) {
            return;
          }

          speakQuestion(
            first
          );
        },
        50
      );
  }

  function stopVoiceSession() {
    endVoiceSession();

    setMode(
      "manual"
    );
  }

  function handleBack() {
    endVoiceSession();

    onBack();
  }

  function handleContinue() {
    endVoiceSession();

    onContinue();
  }

  function prepareFallbackSelection() {
    stopRecognition();

    stopSpeaking();

    retryCountRef.current =
      0;

    setVoiceMessage("");

    setShowVoiceFallback(
      false
    );

    setVoiceStatus(
      "processing"
    );
  }

  function handleFallbackYesNo(
    value: YesNo
  ) {
    const questionId =
      voiceQuestionId;

    prepareFallbackSelection();

    if (
      questionId ===
      "smoking"
    ) {
      updateHabit(
        "smoking",
        value
      );

      if (
        value === "No"
      ) {
        updateHabit(
          "smoking_severity",
          null
        );

        moveToQuestion(
          "alcohol"
        );

        return;
      }

      moveToQuestion(
        "smoking_severity"
      );

      return;
    }

    if (
      questionId ===
      "alcohol"
    ) {
      updateHabit(
        "alcohol",
        value
      );

      moveToQuestion(
        "hard_water"
      );

      return;
    }

    if (
      questionId ===
      "hard_water"
    ) {
      updateHabit(
        "hard_water",
        value
      );

      moveToQuestion(
        "hair_wash_frequency"
      );

      return;
    }

    if (
      questionId ===
      "heating_tools_styling_chemicals"
    ) {
      updateHabit(
        "heating_tools_styling_chemicals",
        value
      );

      moveToQuestion(
        "salon_treatments"
      );

      return;
    }

    if (
      questionId ===
      "salon_treatments"
    ) {
      updateHabit(
        "salon_treatments",
        value
      );

      if (
        value === "No"
      ) {
        updateHabit(
          "salon_treatment_detail",
          ""
        );

        finishVoiceSession();

        return;
      }

      moveToQuestion(
        "salon_treatment_detail"
      );
    }
  }

  function renderVoiceFallback() {
    if (
      !showVoiceFallback
    ) {
      return null;
    }

    const isYesNoQuestion =
      voiceQuestionId ===
        "smoking" ||
      voiceQuestionId ===
        "alcohol" ||
      voiceQuestionId ===
        "hard_water" ||
      voiceQuestionId ===
        "heating_tools_styling_chemicals" ||
      voiceQuestionId ===
        "salon_treatments";

    if (isYesNoQuestion) {
      return (
        <div
          className="mode-grid"
          style={{
            width: "100%",
            maxWidth: "520px",
            marginTop: "20px",
          }}
        >
          {(
            [
              "Yes",
              "No",
            ] as YesNo[]
          ).map(
            (option) => (
              <button
                key={
                  option
                }
                type="button"
                className="habit-choice"
                onClick={() =>
                  handleFallbackYesNo(
                    option
                  )
                }
              >
                {option}
              </button>
            )
          )}
        </div>
      );
    }

    if (
      voiceQuestionId ===
      "smoking_severity"
    ) {
      return (
        <div
          className="three-choice-grid"
          style={{
            width: "100%",
            maxWidth: "620px",
            marginTop: "20px",
          }}
        >
          {smokingSeverityOptions.map(
            (option) => (
              <button
                key={
                  option
                }
                type="button"
                className="habit-choice"
                onClick={() => {
                  prepareFallbackSelection();

                  updateHabit(
                    "smoking_severity",
                    option
                  );

                  moveToQuestion(
                    "alcohol"
                  );
                }}
              >
                {
                  smokingSeverityLabels[
                    option
                  ]
                }
              </button>
            )
          )}
        </div>
      );
    }

    if (
      voiceQuestionId ===
      "hair_wash_frequency"
    ) {
      return (
        <div
          className="three-choice-grid"
          style={{
            width: "100%",
            maxWidth: "620px",
            marginTop: "20px",
          }}
        >
          {hairWashOptions.map(
            (option) => (
              <button
                key={
                  option
                }
                type="button"
                className="habit-choice"
                onClick={() => {
                  prepareFallbackSelection();

                  updateHabit(
                    "hair_wash_frequency",
                    option
                  );

                  moveToQuestion(
                    "heating_tools_styling_chemicals"
                  );
                }}
              >
                {option}
              </button>
            )
          )}
        </div>
      );
    }

    if (
      voiceQuestionId ===
      "salon_treatment_detail"
    ) {
      return (
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            className="salon-detail-input"
            autoComplete="off"
            value={
              fallbackText
            }
            onChange={(event) =>
              setFallbackText(
                event.target.value
              )
            }
            placeholder="For example, keratin treatment, or I don't remember the name"
          />

          <button
            type="button"
            className="page-three-continue"
            style={{
              width: "100%",
              marginTop: "12px",
            }}
            disabled={
              fallbackText
                .trim()
                .length === 0
            }
            onClick={() => {
              const value =
                fallbackText.trim();

              if (!value) {
                return;
              }

              prepareFallbackSelection();

              updateHabit(
                "salon_treatment_detail",
                value
              );

              finishVoiceSession();
            }}
          >
            Continue
            <span>→</span>
          </button>
        </div>
      );
    }

    return null;
  }

  useEffect(() => {
    return () => {
      voiceSessionActiveRef.current =
        false;

      sessionIdRef.current +=
        1;

      if (
        transitionTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          transitionTimeoutRef.current
        );
      }

      if (
        questionTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          questionTimeoutRef.current
        );
      }

      if (
        speechWatchTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          speechWatchTimeoutRef.current
        );
      }

      const recognition =
        recognitionRef.current;

      recognitionRef.current =
        null;

      if (recognition) {
        try {
          recognition.onresult =
            null;

          recognition.onerror =
            null;

          recognition.onend =
            null;

          recognition.abort();
        } catch {
          // Already inactive.
        }
      }

      if (
        "speechSynthesis" in
        window
      ) {
        window.speechSynthesis.cancel();
      }
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
                      key={
                        option
                      }
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
                        {selected &&
                          "✓"}
                      </span>

                      <span>
                        {option}
                      </span>
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

              {mode ===
                "manual" && (
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

            {mode ===
              "choose" && (
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
                    onClick={() => {
                      endVoiceSession();

                      setMode(
                        "manual"
                      );
                    }}
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

            {mode ===
              "manual" && (
              <div className="manual-habits-form">
                <YesNoField
                  question="Do you currently smoke?"
                  value={
                    intake.habits
                      .smoking
                  }
                  onSelect={(
                    value
                  ) => {
                    updateHabit(
                      "smoking",
                      value
                    );

                    if (
                      value ===
                      "No"
                    ) {
                      updateHabit(
                        "smoking_severity",
                        null
                      );
                    }
                  }}
                />

                {intake.habits
                  .smoking ===
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
                            key={
                              value
                            }
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
                            {
                              smokingSeverityLabels[
                                value
                              ]
                            }
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <YesNoField
                  question="Do you drink alcohol?"
                  value={
                    intake.habits
                      .alcohol
                  }
                  onSelect={(
                    value
                  ) =>
                    updateHabit(
                      "alcohol",
                      value
                    )
                  }
                />

                <YesNoField
                  question="Do you regularly wash your hair with hard water?"
                  value={
                    intake.habits
                      .hard_water
                  }
                  onSelect={(
                    value
                  ) =>
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
                          key={
                            value
                          }
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
                  onSelect={(
                    value
                  ) =>
                    updateHabit(
                      "heating_tools_styling_chemicals",
                      value
                    )
                  }
                />

                <YesNoField
                  question="Have you had salon treatments such as colouring, straightening, smoothing, keratin, or similar chemical treatments?"
                  value={
                    intake.habits
                      .salon_treatments
                  }
                  onSelect={(
                    value
                  ) => {
                    updateHabit(
                      "salon_treatments",
                      value
                    );

                    if (
                      value ===
                      "No"
                    ) {
                      updateHabit(
                        "salon_treatment_detail",
                        ""
                      );
                    }
                  }}
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
                      autoComplete="off"
                      value={
                        intake.habits
                          .salon_treatment_detail
                      }
                      onChange={(
                        event
                      ) =>
                        updateHabit(
                          "salon_treatment_detail",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="For example, colouring, keratin, or I don't remember the name"
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
          onClick={
            handleBack
          }
        >
          <span>←</span>
          Back
        </button>

        <button
          type="button"
          className="page-three-continue"
          onClick={
            handleContinue
          }
        >
          Continue
          <span>→</span>
        </button>
      </nav>

      {mode ===
        "voice" && (
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

            {!showVoiceFallback && (
              <>
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
                            key={
                              bar
                            }
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
                          !voiceSessionActiveRef.current
                        ) {
                          return;
                        }

                        if (
                          voiceStatus ===
                          "listening"
                        ) {
                          stopRecognition();

                          setVoiceStatus(
                            "idle"
                          );

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
                      ? "Speaking…"
                      : voiceStatus ===
                        "listening"
                      ? "Listening…"
                      : voiceStatus ===
                        "processing"
                      ? "Got it…"
                      : "Ready"}
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
              </>
            )}

            {voiceMessage && (
              <p className="voice-message">
                {voiceMessage}
              </p>
            )}

            {renderVoiceFallback()}
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
  onSelect: (
    value: YesNo
  ) => void;
}) {
  return (
    <div className="habit-field">
      <div className="habit-label">
        {question}
      </div>

      <div className="two-choice-grid">
        {(
          [
            "Yes",
            "No",
          ] as YesNo[]
        ).map(
          (option) => (
            <button
              key={
                option
              }
              type="button"
              onClick={() =>
                onSelect(
                  option
                )
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
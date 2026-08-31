import { useState } from "react";
import "./languagePage.css";

type LanguagePageProps = {
  onContinue: () => void;
};

type Language = "english" | null;

export default function LanguagePage({ onContinue }: LanguagePageProps) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(null);

  const englishSelected = selectedLanguage === "english";

  return (
    <div className="language-page">
      <header className="language-header">
        <div className="language-header__inner">
          <div className="language-brand">GenoRoot</div>
          <div className="language-patient-label">
            PATIENT INTAKE
          </div>
        </div>
      </header>

      <main className="language-main">
        <section className="language-heading">
          <span className="language-eyebrow">
            WELCOME
          </span>

          <h1>Choose your language</h1>

          <p>
            Select the language you’d like to use for your
            intake experience.
          </p>
        </section>

        <section
          className="language-options"
          aria-label="Choose your language"
        >
          <button
            type="button"
            className={`language-card ${
              englishSelected
                ? "language-card--selected"
                : ""
            }`}
            onClick={() => setSelectedLanguage("english")}
            aria-pressed={englishSelected}
          >
            <div className="language-card__top">
              <span className="language-card__name">
                English
              </span>

              {englishSelected && (
                <span
                  className="language-check"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </div>

            <span className="language-card__description">
              Available now
            </span>
          </button>

          <div
            className="language-card language-card--disabled"
            aria-disabled="true"
          >
            <div className="language-card__top">
              <span className="language-card__name">
                हिन्दी
              </span>

              <span className="language-coming-soon">
                COMING SOON
              </span>
            </div>

            <span className="language-card__description">
              Hindi text and voice support is planned.
            </span>
          </div>
        </section>

        <p className="language-future-note">
          More languages are planned as the intake experience
          expands.
        </p>

        <div className="language-action">
          <button
            type="button"
            className="language-continue"
            disabled={!englishSelected}
            onClick={onContinue}
          >
            Continue in English
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </main>
    </div>
  );
}
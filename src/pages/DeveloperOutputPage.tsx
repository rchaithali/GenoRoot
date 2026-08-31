import { useMemo } from "react";

import "./developerOutputPage.css";

function DeveloperOutputPage() {
  const output = useMemo(() => {
    const stored =
      sessionStorage.getItem(
        "genoroot-final-output"
      );

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  return (
    <div className="developer-output-page">
      <header className="developer-output-header">
        <div className="developer-output-header__inner">
          <div className="developer-output-brand">
            GenoRoot
          </div>

          <div className="developer-output-label">
            EVALUATOR OUTPUT
          </div>
        </div>
      </header>

      <main className="developer-output-content">
        <div className="developer-output-heading">
          <span>
            STRUCTURED OUTPUT
          </span>

          <h1>
            Final Intake JSON
          </h1>

          <p>
            This view is intentionally separate
            from the patient-facing intake.
            It exposes the structured output
            produced after a successful
            submission for evaluator and
            development inspection.
          </p>
        </div>

        {output ? (
          <>
            <div className="developer-output-status">
              <span>✓</span>

              Submitted intake output loaded
            </div>

            <pre className="developer-output-json">
              {JSON.stringify(
                output,
                null,
                2
              )}
            </pre>
          </>
        ) : (
          <div className="developer-output-empty">
            <h2>
              No submitted intake found
            </h2>

            <p>
              Complete and submit the patient
              intake first, then return to
              this evaluator route.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default DeveloperOutputPage;
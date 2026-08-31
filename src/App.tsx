import {
  useEffect,
  useState,
} from "react";

import LanguagePage from "./pages/LanguagePage";
import IntakePageOne from "./pages/IntakePageOne";
import IntakePageTwo from "./pages/IntakePageTwo";
import IntakePageThree from "./pages/IntakePageThree";
import IntakePageFour from "./pages/IntakePageFour";
import IntakePageFive from "./pages/IntakePageFive";
import DeveloperOutputPage from "./pages/DeveloperOutputPage";

type IntakePage =
  | 1
  | 2
  | 3
  | 4
  | 5;

function App() {
  const [
    languageSelected,
    setLanguageSelected,
  ] = useState(false);

  const [
    currentPage,
    setCurrentPage,
  ] = useState<IntakePage>(1);

  const [
    currentHash,
    setCurrentHash,
  ] = useState(
    window.location.hash
  );

  useEffect(() => {
    function handleHashChange() {
      setCurrentHash(
        window.location.hash
      );
    }

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);

  if (
    currentHash === "#/output"
  ) {
    return <DeveloperOutputPage />;
  }

  if (!languageSelected) {
    return (
      <LanguagePage
        onContinue={() =>
          setLanguageSelected(true)
        }
      />
    );
  }

  if (currentPage === 1) {
    return (
      <IntakePageOne
        onContinue={() =>
          setCurrentPage(2)
        }
      />
    );
  }

  if (currentPage === 2) {
    return (
      <IntakePageTwo
        onBack={() =>
          setCurrentPage(1)
        }
        onContinue={() =>
          setCurrentPage(3)
        }
      />
    );
  }

  if (currentPage === 3) {
    return (
      <IntakePageThree
        onBack={() =>
          setCurrentPage(2)
        }
        onContinue={() =>
          setCurrentPage(4)
        }
      />
    );
  }

  if (currentPage === 4) {
    return (
      <IntakePageFour
        onBack={() =>
          setCurrentPage(3)
        }
        onContinue={() =>
          setCurrentPage(5)
        }
      />
    );
  }

  return (
    <IntakePageFive
      onBack={() =>
        setCurrentPage(4)
      }
    />
  );
}

export default App;
import { useState } from 'react';
import '../styles/intro.css';
import ActionArea from "./ActionArea.jsx";
export default function Intro({type, intro_text, disclaimer, checkbox, next, back, currentPage, language}) {
  const [checked, setChecked] = useState(false);
  const hasCheckbox = !!checkbox?.trim();

  return(
    <>
      <div className="intro-page">
        <div className="intro-page-content">
          <div className="intro-page-text" dangerouslySetInnerHTML={{ __html: intro_text }} />
          {disclaimer && (
            <div className="intro-disclaimer" dangerouslySetInnerHTML={{ __html: disclaimer }} />
          )}
        </div>
      </div>
      <ActionArea
        currentPage={currentPage}
        back={back}
        next={next}
        isAvailable={!hasCheckbox || checked}
        type={type}
        language={language}
        checkbox={hasCheckbox ? checkbox : null}
        checked={checked}
        onCheckedChange={setChecked}
      />
    </>

  )
}
import { useState } from 'react';
import '../styles/intro.css';
import ActionArea from "./ActionArea.jsx";
export default function Intro({type, imageUrl, intro_text, disclaimer, checkbox, checkbox2, next, back, currentPage, language}) {
  const [checked, setChecked] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const hasCheckbox = !!checkbox?.trim();
  const hasCheckbox2 = !!checkbox2?.trim();

  return(
    <>
      <div className="intro-page">
        <div className="intro-page-content">
          {imageUrl && (
            <img src={imageUrl} alt="" className="intro-page-image" />
          )}
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
        isAvailable={(!hasCheckbox || checked) && (!hasCheckbox2 || checked2)}
        type={type}
        language={language}
        checkbox={hasCheckbox ? checkbox : null}
        checked={checked}
        onCheckedChange={setChecked}
        checkbox2={hasCheckbox2 ? checkbox2 : null}
        checked2={checked2}
        onCheckedChange2={setChecked2}
      />
    </>

  )
}
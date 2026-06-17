import '../styles/intro.css';
import ActionArea from "./ActionArea.jsx";
export default function Intro({type, intro_text, disclaimer, next, back, currentPage, language}) {
  return(
    <>
      <div className="intro-page">
        <div>
          <div dangerouslySetInnerHTML={{ __html: intro_text }} />
          {disclaimer && (
            <div className="intro-disclaimer" dangerouslySetInnerHTML={{ __html: disclaimer }} />
          )}
        </div>
      </div>
      <ActionArea
        currentPage={currentPage}
        back={back}
        next={next}
        isAvailable
        type={type}
        language={language}
      />
    </>

  )
}
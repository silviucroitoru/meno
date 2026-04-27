import '../styles/intro.css';
import ActionArea from "./ActionArea.jsx";
export default function Intro({type, intro_text, next, back, currentPage, language}) {
  return(
    <>
      <div className="intro-page">
        {
          type === 'intro' ? (
            <div dangerouslySetInnerHTML={{ __html: intro_text }} />
          ) : (
            <div  dangerouslySetInnerHTML={{ __html: intro_text }} />
          )
        }
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
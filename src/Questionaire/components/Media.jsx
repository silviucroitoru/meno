import '../styles/intro.css';
import dummyImage from '../../assets/media_dummy.png';
import ActionArea from "./ActionArea.jsx";
export default function Media({type, intro_text, media_url, next, back, currentPage, language}) {
  return(
    <>
      <div className="media">
        <div  dangerouslySetInnerHTML={{ __html: intro_text }} />
        <img src={media_url ?? dummyImage} alt={intro_text} width="100%" height="auto" />
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
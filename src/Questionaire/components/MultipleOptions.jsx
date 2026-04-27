import { useState, useEffect, useRef } from 'react';
import '../styles/multipleOptions.css';
import ActionArea from "./ActionArea.jsx";
export default function MultipleOptions({
  type,
  question,
  helper,
  options,
  id,
  next,
  back,
  currentPage,
  dataPointId,
  dataPointName,
}){
  const [answersArray, setAnswersArray] = useState([]);
  const containerRef = useRef(null);
  const [headingContainer, setHeadingContainer] = useState(0);
  useEffect(() => {
    // Set the height after the component mounts
    if (containerRef.current) {
      setHeadingContainer(containerRef.current.offsetHeight + 144 + 48);
    }
  }, []);
  const selectOption = (a) => {
    setAnswersArray((prevItems) => {
      if (prevItems.includes(a)) {
        return prevItems.filter(i => i !== a);
      } else {
        return [...prevItems, a];
      }
    });
  }
  const userName = localStorage.getItem("userName");
  return (
    <>
      <div className="multiple-option question-container">
        <div className="heading-container"  ref={containerRef}>
          <h2>{question.replace("first_name", userName)}</h2>
          <p className="helper">{helper}</p>
        </div>
        <div className="options-container main-content-container"  style={{ height: `calc(100% - ${headingContainer}px)` }}>
          {options.map((option) => {
            const answer = option.OptionText.replace('ț', 't').replace('î', 'i').replace('ă', 'a').replace('â', 'a').replace('Î', 'I').replace('ș', 's');
            return (
              <div
                className={`option-multiple ${answersArray.includes(answer) ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  selectOption(answer)
                }}
                key={option.OptionText}
                data-question={id}
              >
                <div className="text-container">
                  <div className="q-text">{option.OptionText}</div>
                </div>
                <div className="check">&nbsp;</div>
              </div>
            )
          })
          }
        </div>
      </div>
      <ActionArea
        currentPage={currentPage}
        back={back}
        next={next}
        dataPointId={dataPointId}
        dataPointName={dataPointName}
        a={answersArray}
        isAvailable={answersArray.length > 0}
        type={type}
      />
    </>

  )
}

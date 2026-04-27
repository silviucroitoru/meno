import { useState, useEffect, useRef } from 'react';
import '../styles/singleOption.css';
import ActionArea from "./ActionArea.jsx";
export default function SingleOption({
  type,
  options,
  question,
  helper,
  jump,
  id,
  next,
  back,
  currentPage,
  dataPointId,
  dataPointName,
}) {
  const containerRef = useRef(null);
  const [headingContainer, setHeadingContainer] = useState(0);
  useEffect(() => {
    // Set the height after the component mounts
    if (containerRef.current && currentPage.position == id) {
      setHeadingContainer(containerRef.current.offsetHeight + 144 + 48);
    }
  }, [currentPage.position]);
  const userName = localStorage.getItem("userName");
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (type === "scale" && currentPage?.position === id) {
        const pressedKey = event.key;
        const selectedOption = options.find(
          (option) => option.OptionValue.toString() === pressedKey
        );

        if (selectedOption) {
          let nextPage = selectedOption.jump || jump || id + 1;
          next(
            nextPage,
            dataPointId,
            dataPointName,
            selectedOption.OptionValue.toString(),
            type
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [type, options, jump, id, next, dataPointId, dataPointName]);

  return(
    <>
      <div className="single-option question-container">
        <div className="heading-container" ref={containerRef}>
          <h2>{question.replace("first_name", userName)}</h2>
          <p className="helper">{helper}</p>
        </div>
        <div className="options-container main-content-container" style={{ height: `calc(100% - ${headingContainer}px)` }}>
          {
            options.map((option) => {
              const answer = option.OptionText.replace('ț', 't').replace('î', 'i').replace('ă', 'a').replace('â', 'a').replace('Î', 'I').replace('ș', 's')
              let nextPage = id + 1;
              if (option.jump) {
                nextPage = option.jump;
              } else if (jump) {
                nextPage = jump;
              }
              return (
                <div
                  className={`option ${option.image_url ? 'with-image' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => next(nextPage, dataPointId, dataPointName, type === 'scale' ? option.OptionValue.toString() : answer, type)}
                  key={option.OptionText}
                  data-question={id}
                >
                  {option.image_url && (
                    <img src={option.image_url} width="48" height="48"/>
                  )}

                  {type === 'scale' && (
                    <div className="scale-no">
                      <span>{option.OptionValue}</span>
                    </div>
                  )}
                  <div className="text-container">
                    <div className="q-text">{option.OptionText}</div>
                    {option.helper && (
                      <div className="helper">{option.helper}</div>
                    )}
                  </div>
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
      />
    </>
  )
}
import { useState, useEffect, useRef } from 'react';
import '../styles/multipleOptions.css';
import ActionArea from "./ActionArea.jsx";

function OptionRow({ answer, selected, onSelect, questionId }) {
  return (
    <div
      className={`option-multiple ${selected ? 'selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      key={answer}
      data-question={questionId}
    >
      <div className="text-container">
        <div className="q-text">{answer}</div>
      </div>
      <div className="check">&nbsp;</div>
    </div>
  );
}

export default function MultipleOptions({
  type,
  question,
  helper,
  options,
  excluder,
  id,
  next,
  back,
  currentPage,
  dataPointId,
  dataPointName,
}) {
  const [answersArray, setAnswersArray] = useState([]);
  const containerRef = useRef(null);
  const [headingContainer, setHeadingContainer] = useState(0);
  const excluderText = excluder?.trim() || null;

  useEffect(() => {
    if (containerRef.current) {
      setHeadingContainer(containerRef.current.offsetHeight + 144 + 48);
    }
  }, []);

  const selectOption = (answer, isExcluder = false) => {
    setAnswersArray((prevItems) => {
      if (isExcluder) {
        if (prevItems.includes(answer)) return [];
        return [answer];
      }
      if (prevItems.includes(answer)) {
        return prevItems.filter((i) => i !== answer);
      }
      const withoutExcluder = excluderText
        ? prevItems.filter((i) => i !== excluderText)
        : prevItems;
      return [...withoutExcluder, answer];
    });
  };

  const userName = localStorage.getItem("userName");
  return (
    <>
      <div className="multiple-option question-container">
        <div className="heading-container" ref={containerRef}>
          <h2>{question.replace("first_name", userName)}</h2>
          <p className="helper">{helper}</p>
        </div>
        <div className="options-container main-content-container" style={{ height: `calc(100% - ${headingContainer}px)` }}>
          {options.map((option) => {
            const answer = option.OptionText;
            return (
              <OptionRow
                key={answer}
                answer={answer}
                selected={answersArray.includes(answer)}
                onSelect={() => selectOption(answer)}
                questionId={id}
              />
            );
          })}
          {excluderText && (
            <OptionRow
              answer={excluderText}
              selected={answersArray.includes(excluderText)}
              onSelect={() => selectOption(excluderText, true)}
              questionId={id}
            />
          )}
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
  );
}

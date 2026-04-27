import '../styles/steps.css'
import ActionArea from "./ActionArea.jsx";
export default function Steps({
  heading,
  helper,
  steps,
  next,
  back,
  currentPage
}){
  return (
    <>
      <div className="steps-container">
        <div className="heading-container">
          <h2>{heading}</h2>
          {
            helper && (
              <p className="helper">{helper}</p>
            )
          }
        </div>
        <div className="steps-wrapper main-content-container">
          <div className="steps">
            {
              steps.map((step, index) => {
                const nextStepIndex = index + 1
                const nextStepStatus = steps[nextStepIndex]?.status
                return (
                  <div className={`step ${step?.status} ${nextStepStatus == 'unchecked' ? 'gradient' : ''}`}
                       key={step.text}>
                    <div className="step-text">
                      {step.text}
                    </div>
                    {step.helper && (
                      <p className="helper">{step.helper}</p>
                    )}
                  </div>
                )
              })
            }
          </div>

        </div>
      </div>
      <ActionArea
        currentPage={currentPage}
        back={back}
        next={next}
        isAvailable
      />
    </>

  )
}
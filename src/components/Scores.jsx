import "./styles/scores.css"
export default function Scores() {
  return (
    <div className="scores">
      <div className="score-card-main">
        <div className="score-card-main-info">
          <div className="score-card-main-info-score">
            <div className="score-title">Health Score</div>
            <div className="score-value">72</div>
          </div>
          <div className="score-card-main-info-accuracy">
            <div className="score-card-main-info-accuracy-title">
              <span className="score-card-main-info-accuracy-title-text">Accuracy</span>
              <span className="score-card-main-info-accuracy-title-value">95%</span>
            </div>
            <div className="score-card-main-info-accuracy-visual">
              <span className="active"></span>
              <span className="active"></span>
              <span className="active"></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div className="score-card-main-assesment">
          <span>Strong and Balanced</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#8E9B91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="score-card">
        <div className="score-card-info">
          <p className="score-title">Sleep score</p>
          <p className="score-description">Low to Moderate</p>
        </div>
        <div className="score-card-value">
          <p className="score-value">72</p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#8E9B91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="score-card">
        <div className="score-card-info">
          <p className="score-title">Sleep score</p>
          <p className="score-description">Low to Moderate</p>
        </div>
        <div className="score-card-value">
          <p className="score-value">72</p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#8E9B91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="score-card">
        <div className="score-card-info">
          <p className="score-title">Sleep score</p>
          <p className="score-description">Low to Moderate</p>
        </div>
        <div className="score-card-value">
          <p className="score-value">72</p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#8E9B91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
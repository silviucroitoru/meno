import React, { useState, useEffect } from "react";
import {FormattedMessage} from "react-intl";

const ScoreCircle = ({ score, size, strokeWidth, duration = 1500 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(circumference);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setProgress(circumference - (score / 100) * circumference);
    }, 100);
  }, [score, circumference]);
  useEffect(() => {
    setTimeout(() => {
      let start = 0;
      const stepTime = duration / score;
      if (score > 0) {
        const timer = setInterval(() => {
          start += 1;
          setAnimatedScore(start);
          if (start >= score) clearInterval(timer);
        }, stepTime);

        return () => clearInterval(timer); // Cleanup on unmount or score change
      } else {
        setAnimatedScore(0);
      }
    }, 300)

  }, [score, duration]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-circle">
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="white"
        stroke="#D8DBE4"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#3D497A"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={progress} // Now starts empty and fills up
        strokeLinecap="round"
        transform={`rotate(90 ${size / 2} ${size / 2})`} // Rotate to start from the top
        style={{
          transition: `stroke-dashoffset ${duration ?? 1500}ms ease-in-out`,
          transitionDelay: `300ms`
        }}
      />
      <text
        x="50%"
        y="45%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="36"
        fill="#3D497A"
      >
        {animatedScore}
      </text>
      <text
        x="50%"
        y="65%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="14"
        fill="#3D497A"
      >
        <FormattedMessage id="my_score" />
      </text>
    </svg>
  );
};

export default ScoreCircle;

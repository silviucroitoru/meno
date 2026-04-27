import { useState, useEffect } from 'react';
import '../styles/registerForm.css';
import ActionArea from "./ActionArea.jsx";
export default function RegisterForm({
  heading,
  helper,
  first_name_label,
  text_error_message,
  last_name_label,
  email_label,
  email_error_message,
  next,
  back,
  currentPage,
}){
  const [focusedFirstName, setFocusedFirstName] = useState(false);
  const [focusedLastName, setFocusedLastName] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);

  const handleFocus = (inputName) => {
    if(inputName === 'firstName'){
      setFocusedFirstName(true);
    } else if(inputName === 'lastName'){
      setFocusedLastName(true)
    } else if(inputName === 'email'){
      setFocusedEmail(true)
    }
  }
  const handleBlur = () => {
    if (!firstName) {
      setFocusedFirstName(false);
    }
    if (!lastName) {
      setFocusedFirstName(false);
    }
    if (!email) {
      setFocusedFirstName(false);
    }
  };
  useEffect(() => {
    const regex = /^[a-zA-Z0-9"][a-zA-Z0-9"%!+_.-]{0,63}@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,15}$/;
    setIsAvailable(
      firstName.length > 0
      && lastName.length > 0
      && email.length > 0
      && regex.test(email)
    )
  }, [firstName, lastName, email])
  return (
    <div className="register-container">
      <div className="heading-container">
        <h2>{heading}</h2>
        {helper && (
          <p className="helper">{helper}</p>
        )}
      </div>
      <div className="register-form main-content-container">
        <div className="form-row w-half">
          <div className={`input-field floating-input ${focusedFirstName || firstName ? "focused" : ""}`} >
            <input
              type="text"
              value={firstName}
              onFocus={() => handleFocus('firstName')}
              onBlur={() => handleBlur('firstName')}
              onChange={(e) => {setFirstName(e.target.value)}}
              id="first_name"
              name="firstname"
            />
            <label>{first_name_label}</label>
            <div className="input-error">{text_error_message}</div>
          </div>
          <div className={`input-field floating-input ${focusedLastName || lastName ? "focused" : ""}`} >
            <input
              type="text"
              value={lastName}
              onFocus={() => handleFocus('lastName')}
              onBlur={() => handleBlur('lastName')}
              onChange={(e) => {setLastName(e.target.value)}}
              id="last_name"
              name="lastname"
            />
            <label>{last_name_label}</label>
            <div className="input-error">{text_error_message}</div>
          </div>
        </div>
        <div className="form-row w-full">
          <div className={`input-field floating-input ${focusedEmail || email ? "focused" : ""}`} >
            <input
              type="email"
              value={email}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              onChange={(e) => {setEmail(e.target.value)}}
              id="email_address"
              name="email"
            />
            <label>{email_label}</label>
            <div className="input-error">{email_error_message}</div>
          </div>
        </div>
        <textarea id="teste" name="questionnaire" className="hidden"></textarea>
      </div>
      <ActionArea
        currentPage={currentPage}
        back={back}
        next={next}
        isAvailable={isAvailable}
      />
    </div>
  )
}
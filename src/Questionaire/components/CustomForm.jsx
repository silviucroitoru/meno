import { useState, useRef, useEffect } from 'react';
import '../styles/customForm.css'
import ActionArea from "./ActionArea.jsx";
import { useTranslate } from "@tolgee/react";
import {FormattedMessage} from "react-intl";

export default function CustomForm({
  question,
  helper,
  fields,
  type,
  currentPage,
  next,
  back,
  id,
  dataPointId,
  dataPointName,
  userName,
}){
  const { t } = useTranslate();
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const [fullValue, setFullValue] = useState("");
  const [birthDateError, setBirthDateError] = useState(false);
  const [fieldType, setFieldType] = useState('other')
  const user = localStorage.getItem("userName") ?? userName;
  const inputRef = useRef(null); // Reference for first input field
  const handleFocus = () => setFocused(true);
  const handleBlur = () => {
    if (!value) {
      setFocused(false);
    }
  };
  useEffect(() => {
    if (currentPage?.position === id && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentPage?.position, id]);
  const handleKeyPress = (event, field) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if(field === "birthYear") {
        if(value.length !== 4) {
          setBirthDateError(true);
          return;
        }
      }
      if(isButtonAvailable()){
        next(currentPage.jump ? currentPage.jump : currentPage.position + 1, dataPointId, dataPointName, fullValue, type)
      }

    }
  };
  const isButtonAvailable = () => {
    if(type === 'email'){
      const emailRegex = /^[a-zA-Z0-9"][a-zA-Z0-9"%!+_.-]{0,63}@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,15}$/;
      return emailRegex.test(value)
    }
    if(fieldType === 'birthYear') {
      return value.length === 4;
    }
    return value !== ''
  }
  return (
    <>
      <div className="custom-form">
        <div className="heading-container">
          <h2>{question.replace("{first_name}", user)}</h2>
          <p className="helper">{helper}</p>
        </div>
        <div className="main-content-container">
          <div className="fields">
            {
              type === "first_name" ? (
                <div className="custom-field">
                  <div className={`input-field ${focused || value ? "focused" : ""}`}>
                    <input
                      ref={inputRef}
                      type="text"
                      className="full-radius"
                      value={value}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      onChange={(e) => {setValue(e.target.value); setFullValue(e.target.value)}}
                      data-name="{{ id }}"
                      autoFocus={true}
                      onKeyDown={handleKeyPress}
                      enterKeyHint="next"
                    />
                    <label><FormattedMessage id="first_name" /></label>
                  </div>
                </div>
              ) : (type === "email" ? (
                <div className="custom-field">
                  <div className={`input-field ${focused || value ? "focused" : ""}`}>
                    <input
                      ref={inputRef}
                      type="email"
                      className="full-radius"
                      value={value}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      onChange={(e) => {setValue(e.target.value); setFullValue(e.target.value)}}
                      data-email="{{ id }}"
                      autoFocus={true}
                      onKeyDown={handleKeyPress}
                      enterKeyHint="send"
                    />
                    <label>Email</label>
                  </div>
                </div>
                ) : (
                <>
                  {
                    fields?.map((field, index) => {
                      return (
                        <div className="custom-field" key={field?.label}>
                          {(field?.type === 'numeric' || field?.type === 'alphanumeric') ? (
                            <div className={`input-field floating-input ${focused || value ? "focused" : ""} ${birthDateError ? 'error' : ''}`}>
                              <input
                                ref={index === 0 ? inputRef : null}
                                type={field?.type === 'numeric' ? 'number' : 'text'}
                                id={field?.label?.replace(' ', '-')}
                                min={0}
                                value={value}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onChange={(e) => {
                                  setFieldType(field?.measurement && (field?.measurement === 'Year' || field?.measurement === 'An') ? 'birthYear' : 'other');
                                  setBirthDateError(false);
                                  setValue(e.target.value);
                                  setFullValue(field?.measurement && field?.measurement !== 'Year' && field?.measurement !== 'An' ? `${e.target.value}${field?.measurement}` : e.target.value)
                                }}
                                data-name="{{ id }}"
                                data-q={field?.label}
                                data-mandatory={field.mandatory}
                                onKeyDown={(e) => {
                                  const isBirthYear = field?.measurement && (field?.measurement === 'Year' || field?.measurement === 'An')
                                  handleKeyPress(e, isBirthYear ? 'birthYear' : 'other');
                                }}
                                autoFocus={true}
                                enterKeyHint="next"
                              />
                              <label>{field?.label}</label>
                              {birthDateError && (
                                <div className="input-error">
                                  <FormattedMessage id='birthYearError' />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="input-field">
                              <textarea
                                id={field?.label?.replace(' ', '-')}
                                value={value}
                                onChange={(e) => {setValue(e.target.value); setFullValue(e.target.value)}}
                                placeholder={field?.label}
                                data-name="{{ id }}"
                                data-q={question}
                                data-mandatory={field?.mandatory}
                                autoFocus={true}
                                enterkeyhint="Continue"
                              ></textarea>
                              <div className="input-error">{field?.error_message}</div>
                            </div>
                          )}
                          {field?.type !== 'textarea' && (
                            <div className="measurement">
                              {field?.measurement}
                            </div>
                          )}
                        </div>
                      )
                    })
                  }
                </>
              ))
            }
          </div>
        </div>
      </div>
      <ActionArea
        currentPage={currentPage}
        back={back}
        next={next}
        dataPointId={dataPointId}
        dataPointName={dataPointName}
        a={fullValue}
        isAvailable={isButtonAvailable()}
        type={type}
      />
    </>
  )
}
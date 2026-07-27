import Questionaire from "../Questionaire/Questionaire.jsx";

const questionCta = {
  consultationLabel: "contraception_cta_consultation",
  consultationLink: "contraception_consultation_link",
  phoneLabel: "contraception_cta_phone",
  phoneLink: "contraception_phone_link",
  excludeTypes: ["intro", "first_name", "custom_form", "email", "phone"],
};

export default function ContraceptionQuestionnaire() {
  return (
    <Questionaire
      getEndpoint="get-contraception-questionnaire"
      updateEndpoint="update-contraception-response"
      submissionStorageKey="ContraceptionSubmissionID"
      completionPath="/contraception/results"
      reportEndpoint="generate-contraception-report"
      questionCta={questionCta}
    />
  );
}

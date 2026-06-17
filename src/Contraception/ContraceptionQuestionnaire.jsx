import Questionaire from "../Questionaire/Questionaire.jsx";

export default function ContraceptionQuestionnaire() {
  return (
    <Questionaire
      getEndpoint="get-contraception-questionnaire"
      updateEndpoint="update-contraception-response"
      submissionStorageKey="ContraceptionSubmissionID"
      completionPath="/contraception/results"
    />
  );
}

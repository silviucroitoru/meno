import Questionaire from "../Questionaire/Questionaire.jsx";

export default function IRQuestionnaire() {
  return (
    <Questionaire
      getEndpoint="get-ir-questionnaire"
      updateEndpoint="update-ir-response"
      submissionStorageKey="IRSubmissionID"
      completionPath="/ir/results"
      reportEndpoint="generate-ir-report"
      completionType="phone"
    />
  );
}

import Intro from "./Intro.jsx";
import SingleOption from "./SingleOption.jsx";
import MultipleOptions from "./MultipleOptions.jsx";
import Steps from "./Steps.jsx";
import CustomForm from "./CustomForm.jsx";
import Contact from "./Contact.jsx";
import RegisterForm from "./RegisterForm.jsx";
import Media from "./Media.jsx";

export default function Page({page, next, back, currentPage, userName, language}) {
  switch (page.QuestionType) {
    case 'intro':
      return (
        <Intro
          intro_text={page.settings.RichText}
          next={next}
          back={back}
          currentPage={currentPage}
          type={page.QuestionType}
          language={language}
        />
      )
    case 'first_name':
      return (
        <CustomForm
          question={page.settings.QuestionText}
          helper={page.settings.QuestionHelper}
          type={page.QuestionType}
          userName={userName}
          fields={[]}
          next={next}
          back={back}
          id={page.position}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'single_option':
      return (
        <SingleOption
          type={page.QuestionType}
          options={page.settings.options}
          question={page.settings.QuestionText}
          helper={page.settings.QuestionHelper}
          jump={page.jump}
          id={page.position}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'scale':
      return (
        <SingleOption
          type={page.QuestionType}
          options={page.settings.options}
          question={page.settings.QuestionText}
          helper={page.settings.QuestionHelper}
          jump={page.jump}
          id={page.position}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'single_option_image':
      return (
        <SingleOption
          type={page.QuestionType}
          options={page.settings.options}
          question={page.settings.QuestionText}
          helper={page.settings.QuestionHelper}
          jump={page.jump}
          id={page.position}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'multiple_option':
      return (
        <MultipleOptions
          type={page.QuestionType}
          options={page.settings.options}
          question={page.settings.QuestionText}
          helper={page.settings.QuestionHelper}
          id={page.position}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'custom_form':
      return (
        <CustomForm
          question={page.settings.QuestionText}
          helper={page.settings.QuestionHelper}
          fields={page.settings.fields}
          next={next}
          back={back}
          currentPage={currentPage}
          id={page.position}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'steps':
      return (
        <Steps
          heading={page.settings.heading}
          helper={page.settings.QuestionHelper}
          steps={page.settings.steps}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'contact':
      return (
        <Contact
          heading={page.settings.heading}
          helper={page.settings.QuestionHelper}
          contacts={page.settings.contact}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'email':
      return (
        <CustomForm
          question={page.settings.QuestionText}
          helper={page.settings.QuestionHelper}
          fields={page.settings.fields}
          type={page.QuestionType}
          next={next}
          back={back}
          id={page.position}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'register_form':
      return (
        <RegisterForm
          heading={page.settings.heading}
          helper={page.settings.QuestionHelper}
          first_name_label={page.settings.first_name_label}
          last_name_label={page.settings.last_name_label}
          email_label={page.settings.email_label}
          text_error_message={page.settings.text_error_message}
          email_error_message={page.settings.email_error_message}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'message':
      return (
        <Intro
          intro_text={page.settings.intro_text}
          type={page.QuestionType}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
    case 'media':
      return (
        <Media
          intro_text={page.settings.RichText}
          media_url={page.settings.MediaUrl}
          type={page.QuestionType}
          next={next}
          back={back}
          currentPage={currentPage}
          dataPointId={page.DataPointID}
          dataPointName={page.DataPointName}
        />
      )
  }
}
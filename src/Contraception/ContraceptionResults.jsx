import "../LeadQuestionAnswer/loader.css";

export default function ContraceptionResults() {
  return (
    <div className="loader">
      <div className="topic-header">
        <a href="/contraception">
          <img src="/primea_logo.png" alt="Primea" className="logo" />
        </a>
      </div>
      <div className="loader-content">
        <div className="title">Hvala vam!</div>
        <div className="description">
          Vaši odgovori su sačuvani. Uskoro ćemo vas kontaktirati.
        </div>
      </div>
    </div>
  );
}

import "./styles/breadcrumbs.css"
export default function Breadcrumbs() {
  return (
    <div className="breadcrumbs">
      <a href="/dashboard" className="home">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.66667 14.1682H13.3333M9.18141 2.30492L3.52949 6.70086C3.15168 6.99471 2.96278 7.14163 2.82669 7.32563C2.70614 7.48862 2.61633 7.67224 2.56169 7.86746C2.5 8.08785 2.5 8.32717 2.5 8.8058V14.8349C2.5 15.7683 2.5 16.235 2.68166 16.5916C2.84144 16.9052 3.09641 17.1601 3.41002 17.3199C3.76654 17.5016 4.23325 17.5016 5.16667 17.5016H14.8333C15.7668 17.5016 16.2335 17.5016 16.59 17.3199C16.9036 17.1601 17.1586 16.9052 17.3183 16.5916C17.5 16.235 17.5 15.7683 17.5 14.8349V8.8058C17.5 8.32717 17.5 8.08785 17.4383 7.86746C17.3837 7.67224 17.2939 7.48862 17.1733 7.32563C17.0372 7.14163 16.8483 6.99471 16.4705 6.70086L10.8186 2.30492C10.5258 2.07721 10.3794 1.96335 10.2178 1.91959C10.0752 1.88097 9.92484 1.88097 9.78221 1.91959C9.62057 1.96335 9.47418 2.07721 9.18141 2.30492Z"
            stroke="#1E3723" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12L10 8L6 4" stroke="#8E9B91" strokeWidth="1.33333" strokeLinecap="round"
              strokeLinejoin="round"/>
      </svg>
      <a href="/dashboard" className="breadcrumb">Sleep and Recovery</a>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12L10 8L6 4" stroke="#8E9B91" strokeWidth="1.33333" strokeLinecap="round"
              strokeLinejoin="round"/>
      </svg>
      <a href="/dashboard" className="breadcrumb">How can I improve my sleep quality?</a>
    </div>
  );
}
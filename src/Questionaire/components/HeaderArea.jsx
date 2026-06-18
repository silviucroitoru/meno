export default function HeaderArea({currentPage, progressPages, qLength}) {
  return(
    <>
      <a href="https://primea.rs/" target="_blank" rel="noopener noreferrer">
        <img src="/primea_logo.png" alt="Primea"
             className="logo"/>
      </a>
      {
        currentPage.position !== 1 && (
          <div className="progress-bar-container" id="progress-bar-container">
            <div className="progress-bar">
              <span id="progress" style={{ width: (progressPages.length * 100 / qLength) + '%'}}></span>
            </div>
          </div>
        )
      }
    </>
  )
}
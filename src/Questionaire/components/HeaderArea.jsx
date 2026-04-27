export default function HeaderArea({currentPage, progressPages, qLength}) {
  return(
    <>
      <a href="/">
        <img src="https://evrbloom.ro/cdn/shop/files/evrbloom_logo.svg?v=1742998418&width=100" alt="EvrBloom"
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
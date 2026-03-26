import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import './Header.css'

function Header({ title, showBack = false, backTo = '/' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleBack = () => {
    navigate(backTo)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
        {showBack && (
          <button className="back-button" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="header-title">{title}</h1>
      </div>
      
      <div className="header-right">
        {user && (
          <button className="logout-button" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        )}
      </div>
    </header>
  )
}

export default Header

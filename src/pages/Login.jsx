import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import './Login.css'

const MOCK_USER = {
  email: 'usuario@criptotracker.com',
  password: '123456',
  name: 'Trader Pro'
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      login({ email: MOCK_USER.email, name: MOCK_USER.name })
      navigate('/exchanges')
    } else {
      setError('Email ou senha incorretos')
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-gCsVAU5fByyC8X13cNiLm0M11Qvhsp.png" 
            alt="Cripto Tracker" 
            className="login-logo"
          />
          <h1>Bem-vindo</h1>
          <p>Visualize sua cripto</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-hint">
          <p>Credenciais de teste:</p>
          <code>usuario@criptotracker.com / 123456</code>
        </div>
      </div>
    </div>
  )
}

export default Login

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import Header from '../components/Header'
import './Exchanges.css'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useState } from 'react'


const exchanges = [
  {
    id: 'binance',
    name: 'Binance',
    description: 'A maior corretora de criptomoedas do mundo',
    logo: 'data:image/png;base64,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',
    active: true
  },
  {
    id: 'mercado-bitcoin',
    name: 'Mercado Bitcoin',
    description: 'A maior corretora de criptomoedas da America Latina',
    logo: 'https://images.vexels.com/media/users/3/262111/isolated/lists/317336a6a32b6eb818a39f0fbf4d045b-criptomoeda-de-negocios-bitcoin.png',
    active: false
  }
]

function QRScanner({ onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    )

    scanner.render(
      (decodedText) => {
        console.log("QR:", decodedText)
        scanner.clear()
        onClose()
      },
      (error) => {
        // pode ignorar
      }
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [])

  return <div id="reader" />
}

function Exchanges() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showScanner, setShowScanner] = useState(false)

  const handleExchangeClick = (exchange) => {
    if (exchange.active) {
      navigate('/trading-pairs')
    }
  }

  return (
    <div className="exchanges-page">
      <Header title="Corretoras" showBack={false} />
      
      <main className="exchanges-content">
        <div className="welcome-section">
          <h2>Ola, {user?.name}!</h2>
          <p>Selecione uma corretora para visualizar os pares de negociação</p>
        </div>

        <div className="exchanges-grid">
          {exchanges.map((exchange) => (
            <div
              key={exchange.id}
              className={`exchange-card ${!exchange.active ? 'disabled' : ''}`}
              onClick={() => handleExchangeClick(exchange)}
            >
              <div className="exchange-logo-container">
                <img src={exchange.logo} alt={exchange.name} className="exchange-logo" />
              </div>
              <div className="exchange-info">
                <h3>{exchange.name}</h3>
                <p>{exchange.description}</p>
              </div>
              {!exchange.active && (
                <span className="coming-soon">Em breve</span>
              )}
              {exchange.active && (
                <span className="active-badge">Disponivel</span>
              )}
            </div>
          ))}
        </div>
      </main>
      <button onClick={() => setShowScanner(true)}>
        Escanear QR Code
      </button>
      {showScanner && (
        <div className="scanner-modal">
          <div className="scanner-content">
            <QRScanner onClose={() => setShowScanner(false)} />
            
            <button onClick={() => setShowScanner(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}



export default Exchanges

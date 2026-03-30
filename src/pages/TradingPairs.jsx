import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import './TradingPairs.css'

const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin',       shortName: 'BTC', icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png' },
  { symbol: 'ETHUSDT', name: 'Ethereum',      shortName: 'ETH', icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png' },
  { symbol: 'BNBUSDT', name: 'Binance Coin',  shortName: 'BNB', icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png' },
  { symbol: 'SOLUSDT', name: 'Solana',        shortName: 'SOL', icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png' },
  { symbol: 'XRPUSDT', name: 'Ripple',        shortName: 'XRP', icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png' },
]

// ── Fetchers por corretora ──────────────────────────────────────────────────

async function fetchBinancePrices(symbols) {
  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`
  )
  const data = await response.json()

  const priceMap = {}
  data.forEach(item => {
    priceMap[item.symbol] = {
      price:  parseFloat(item.lastPrice),
      change: parseFloat(item.priceChangePercent),
    }
  })
  return priceMap
}

async function fetchBybitPrices(symbols) {
  const response = await fetch(
    `https://api.bybit.com/v5/market/tickers?category=spot`
  )
  const data = await response.json()

  const priceMap = {}
  if (data.retCode === 0) {
    data.result.list.forEach(item => {
      if (symbols.includes(item.symbol)) {
        priceMap[item.symbol] = {
          price:  parseFloat(item.lastPrice),
          change: parseFloat(item.price24hPcnt) * 100, // Bybit retorna decimal (0.023 = 2.3%)
        }
      }
    })
  }
  return priceMap
}



function TradingPairs() {
  const { exchange } = useParams()
  const navigate = useNavigate()
  const [prices, setPrices]   = useState({})
  const [loading, setLoading] = useState(true)

  const exchangeName = exchange === 'bybit' ? 'Bybit' : 'Binance'

  useEffect(() => {
    const symbols = TRADING_PAIRS.map(p => p.symbol)

    const fetchPrices = async () => {
      try {
        const priceMap =
          exchange === 'bybit'
            ? await fetchBybitPrices(symbols)
            : await fetchBinancePrices(symbols)

        setPrices(priceMap)
      } catch (error) {
        console.error('Erro ao buscar preços:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 10000)
    return () => clearInterval(interval)
  }, [exchange]) // re-executa se trocar de corretora

  const handlePairClick = (symbol) => {
    navigate(`/orderbook/${exchange}/${symbol}`)
  }

  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }

  return (
    <div className="trading-pairs-page">
      <Header title={exchangeName} showBack={true} backTo="/exchanges" />

      <main className="trading-pairs-content">
        <div className="section-header">
          <h2>Pares de Negociação</h2>
          <p>Selecione um par para visualizar o livro de ofertas</p>
        </div>

        <div className="pairs-list">
          {TRADING_PAIRS.map((pair) => {
            const priceData = prices[pair.symbol]
            const isPositive = priceData?.change >= 0

            return (
              <div
                key={pair.symbol}
                className="pair-card"
                onClick={() => handlePairClick(pair.symbol)}
              >
                <div className="pair-left">
                  <div className="pair-icon-container">
                    <img src={pair.icon} alt={pair.name} className="pair-icon" />
                  </div>
                  <div className="pair-info">
                    <h3>{pair.shortName}/USDT</h3>
                    <p>{pair.name}</p>
                  </div>
                </div>

                <div className="pair-right">
                  {loading ? (
                    <div className="price-skeleton"></div>
                  ) : priceData ? (
                    <>
                      <span className="price">${formatPrice(priceData.price)}</span>
                      <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}{priceData.change.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="price">--</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default TradingPairs
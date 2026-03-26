import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import Header from '../components/Header'
import './OrderBook.css'

const PAIR_INFO = {
  BTCUSDT: { 
    name: 'Bitcoin', 
    shortName: 'BTC', 
    icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png' 
  },
  ETHUSDT: { 
    name: 'Ethereum', 
    shortName: 'ETH', 
    icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png' 
  },
  BNBUSDT: { 
    name: 'Binance Coin', 
    shortName: 'BNB', 
    icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png' 
  },
  SOLUSDT: { 
    name: 'Solana', 
    shortName: 'SOL', 
    icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png' 
  },
  XRPUSDT: { 
    name: 'Ripple', 
    shortName: 'XRP', 
    icon: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png' 
  }
}

function OrderBook() {
  const { symbol } = useParams()
  const [activeTab, setActiveTab] = useState('orderbook')
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [trades, setTrades] = useState([])
  const [ticker, setTicker] = useState(null)
  const [loading, setLoading] = useState(true)
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)

  const normalizedSymbol = symbol?.toUpperCase()

  const pairInfo = PAIR_INFO[normalizedSymbol] || { 
    name: symbol, 
    shortName: symbol?.replace('USDT', '') 
  }

  console.log('symbol:', symbol)
  console.log('pairInfo:', pairInfo)  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderBookRes, tradesRes, tickerRes] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=10`),
          fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=20`),
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        ])

        const orderBookData = await orderBookRes.json()
        const tradesData = await tradesRes.json()
        const tickerData = await tickerRes.json()

        setOrderBook({
          bids: orderBookData.bids?.slice(0, 10) || [],
          asks: orderBookData.asks?.slice(0, 10) || []
        })
        setTrades(tradesData.reverse() || [])
        setTicker(tickerData)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [symbol])

  useEffect(() => {
    if (activeTab !== 'chart' || !chartContainerRef.current) return

    const fetchKlines = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`
        )
        const data = await response.json()

        if (chartRef.current) {
          chartRef.current.remove()
        }

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#080808' },
            textColor: '#ffffff'
          },
          grid: {
            vertLines: { color: '#e5e7eb' },
            horzLines: { color: '#e5e7eb' }
          },
          crosshair: {
            mode: 1
          },
          timeScale: {
            borderColor: '#e5e7eb',
            timeVisible: true
          },
          rightPriceScale: {
            borderColor: '#e5e7eb'
          }
        })

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#00c853',
          downColor: '#ef4444',
          borderDownColor: '#ef4444',
          borderUpColor: '#00c853',
          wickDownColor: '#ef4444',
          wickUpColor: '#00c853'
        })

       const candleData = data
  .map(item => ({
    time: Math.floor(item[0] / 1000),
    open: +item[1],
    high: +item[2],
    low: +item[3],
    close: +item[4],
  }))
  .sort((a, b) => a.time - b.time)

console.log(candleData.slice(0, 3))

        candlestickSeries.setData(candleData)
        chart.timeScale().fitContent()
        chartRef.current = chart

        const handleResize = () => {
          if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth })
          }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      } catch (error) {
        console.error('Erro ao buscar grafico:', error)
      }
    }

    fetchKlines()

    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [activeTab, symbol])

  const formatPrice = (price) => {
    const num = parseFloat(price)
    if (num >= 1000) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
  }

  const formatQuantity = (qty) => {
    const num = parseFloat(qty)
    return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="orderbook-page">
      <Header title={`${pairInfo.shortName}/USDT`} showBack={true} backTo="/trading-pairs" />
      
      <main className="orderbook-content">
        <div className="ticker-card">
          <div className="ticker-left">
            <img src={pairInfo.icon} alt={pairInfo.name} className="ticker-icon" />
            <div>
              <h2>{pairInfo.shortName}/USDT</h2>
              <p>{pairInfo.name}</p>
            </div>
          </div>
          {ticker && (
            <div className="ticker-right">
              <span className="ticker-price">${formatPrice(ticker.lastPrice)}</span>
              <span className={`ticker-change ${parseFloat(ticker.priceChangePercent) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(ticker.priceChangePercent) >= 0 ? '+' : ''}
                {parseFloat(ticker.priceChangePercent).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'orderbook' ? 'active' : ''}`}
            onClick={() => setActiveTab('orderbook')}
          >
            Livro de Ofertas
          </button>
          <button
            className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            Historico
          </button>
          <button
            className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            Gráfico
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando dados...</p>
          </div>
        ) : (
          <>
            {activeTab === 'orderbook' && (
              <div className="orderbook-container">
                <div className="orderbook-section">
                  <div className="orderbook-header asks-header">
                    <span>Preco (USDT)</span>
                    <span>Quantidade ({pairInfo.shortName})</span>
                  </div>
                  <div className="asks-list">
                    {orderBook.asks.slice().reverse().map((ask, index) => (
                      <div key={index} className="order-row ask">
                        <span className="price">{formatPrice(ask[0])}</span>
                        <span className="quantity">{formatQuantity(ask[1])}</span>
                        <div 
                          className="depth-bar ask-bar" 
                          style={{ width: `${Math.min(parseFloat(ask[1]) * 10, 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="spread-indicator">
                  <span>Spread: ${ticker ? (parseFloat(orderBook.asks[0]?.[0]) - parseFloat(orderBook.bids[0]?.[0])).toFixed(2) : '--'}</span>
                </div>

                <div className="orderbook-section">
                  <div className="bids-list">
                    {orderBook.bids.map((bid, index) => (
                      <div key={index} className="order-row bid">
                        <span className="price">{formatPrice(bid[0])}</span>
                        <span className="quantity">{formatQuantity(bid[1])}</span>
                        <div 
                          className="depth-bar bid-bar" 
                          style={{ width: `${Math.min(parseFloat(bid[1]) * 10, 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="trades-container">
                <div className="trades-header">
                  <span>Preco (USDT)</span>
                  <span>Quantidade ({pairInfo.shortName})</span>
                  <span>Hora</span>
                </div>
                <div className="trades-list">
                  {trades.map((trade) => (
                    <div key={trade.id} className={`trade-row ${trade.isBuyerMaker ? 'sell' : 'buy'}`}>
                      <span className="price">{formatPrice(trade.price)}</span>
                      <span className="quantity">{formatQuantity(trade.qty)}</span>
                      <span className="time">{formatTime(trade.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'chart' && (
              <div className="chart-container">
                <div ref={chartContainerRef} className="chart" />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default OrderBook

import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import Login from './pages/Login'
import Exchanges from './pages/Exchanges'
import TradingPairs from './pages/TradingPairs'
import OrderBook from './pages/OrderBook'
import Gallery from './pages/Gallery'
import './App.css'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const [user, setUser] = useState(null)

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/exchanges"
            element={
              <ProtectedRoute>
                <Exchanges />
              </ProtectedRoute>
            }
          />
         <Route
          path="/trading-pairs/:exchange" 
          element={
            <ProtectedRoute>
              <TradingPairs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderbook/:exchange/:symbol" 
          element={
            <ProtectedRoute>
              <OrderBook />
            </ProtectedRoute>
          }
        />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}

export default App

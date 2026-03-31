import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../Login'
import { BrowserRouter } from 'react-router-dom'

// mock do useAuth
vi.mock('../../App', () => ({
  useAuth: () => ({
    login: vi.fn()
  })
}))

describe('Login', () => {
  it('deve renderizar os inputs e botão', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('deve mostrar erro com credenciais inválidas', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'errado@email.com' }
    })

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: '123' }
    })

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    const error = await screen.findByText(/email ou senha incorretos/i)
    expect(error).toBeInTheDocument()
  })
})
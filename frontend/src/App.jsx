import { useState } from 'react'
import Login from './pages/auth/login.jsx'
import Register from './pages/auth/register.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('login') // 'login' or 'register'

  const switchToRegister = () => {
    setCurrentPage('register')
  }

  const switchToLogin = () => {
    setCurrentPage('login')
  }

  return (
    <>
      {currentPage === 'login' ? (
        <Login onSwitchToRegister={switchToRegister} />
      ) : (
        <Register onSwitchToLogin={switchToLogin} />
      )}
    </>
  )
}

export default App
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PaymentEntryForm from './pages/PaymentEntryForm'
import { ToastContainer } from "react-toastify";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <ToastContainer position="top-right" autoClose={3000} />
      <PaymentEntryForm/>
    </>
  )
}

export default App

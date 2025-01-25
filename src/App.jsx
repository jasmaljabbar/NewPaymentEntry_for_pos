import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PaymentEntryForm from './PaymentEntryForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PaymentEntryForm/>
    </>
  )
}

export default App

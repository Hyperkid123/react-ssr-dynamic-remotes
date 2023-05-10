import React from 'react'
import { createRoot } from 'react-dom/client'

const rootEl = document.getElementById('root')

const App = () => {
  return (
    <div>
      There will be dragons
    </div>
  )
}

if(rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />)
}
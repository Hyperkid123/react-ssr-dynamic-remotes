import React, { useEffect, useState } from 'react'
import { getFedModules } from '../shared/getFedModules'

const FedModulesList = () => {
  const [data, setData] = useState<Record<string, any> | undefined>(undefined)
  useEffect(() => {
    getFedModules().then(fedModules => {
      setData(fedModules)
    })
  }, [])
  
  if(!data) {
    return (
      <div>
        Loading
      </div>
    )
  }

  return (
    <div>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default FedModulesList
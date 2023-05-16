import React, { Suspense, lazy, useMemo } from 'react'
import { injectScript } from '@module-federation/utilities'

const RemoteComponent = () => {
    const initComponent = async () => {
    // for ssr we need two types of build for remote modules. One for client rendering and one for server rendering.
    // @ts-ignore
    const URL = process.env.IS_SERVER ? 'http://localhost:8004/ssr-server-remote.js' : 'http://localhost:8004/ssr-remote.js'

    // similar to what scalprum openshift sdk is doing
    const container = await injectScript({
      global: 'ssrRemote',
      url: URL ,
    })
    // get the module
    const factory = await container.get('./RemoteApp')
    return factory()
    
  }

  // memoize the component as we call the init method in render
  const Cmp = useMemo(() =>lazy(() => initComponent()), [])
  return (
    <div>
      This will load remote component
      <Suspense fallback="Loading remote component...">
        <Cmp initialCount={11} />
      </Suspense>
    </div>
  )
}

export default RemoteComponent
import React, { Suspense, lazy } from 'react'
const LazyComponent = lazy(() => import('./LazyComponent'))

const App = () => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SSR base</title>
      </head>
      <body>
        <div>
          There will be dragons
          <Suspense fallback="Loading LazyComponent...">
            <LazyComponent />
          </Suspense>
        </div>
      </body>
    </html>
  )
}

export default App;

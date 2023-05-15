import React, { Suspense, lazy } from 'react'
import RemoteComponent from './RemoteComponent';
import { Link, Route, Routes } from 'react-router-dom';
import AuthProvider from './shared/AuthProvider';
import FedModulesList from './components/FedModulesList';

const LazyComponent = lazy(() => import('./LazyComponent'))

const App = ({ token }: { token?: string }) => {
  return (
    <AuthProvider token={token}>
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>SSR base</title>
        </head>
        <body>
          <div>
            There will be dragons
            {/* Standard react lazy component */}
            <Suspense fallback="Loading LazyComponent...">
              <LazyComponent />
            </Suspense>
            {/* Remote react component */}
            <RemoteComponent />
            <div>
              <Link to="/foo">Link for foo</Link>
            </div>
            <Routes>
              <Route path='/foo' element={<div>A route for /foo</div>}/>
            </Routes>
          </div>
          <Suspense fallback="Loading fed modules list....">
            <FedModulesList />
          </Suspense>
        </body>
      </html>
    </AuthProvider>
  )
}

export default App;

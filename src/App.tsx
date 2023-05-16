import '@patternfly/react-core/dist/styles/base.css';

import React, { Suspense, lazy } from 'react';
import RemoteComponent from './RemoteComponent';
import { Link, Route, Routes } from 'react-router-dom';
import AuthProvider from './shared/AuthProvider';
import FedModulesList from './components/FedModulesList';
import Root from './Routes/Root';

const LazyComponent = lazy(() => import('./LazyComponent'));

const Dump = () => {
  return (
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
      <Suspense fallback="Loading fed modules list....">
        <FedModulesList />
      </Suspense>
    </div>
  );
};

const App = ({ token }: { token?: string }) => {
  return (
    <AuthProvider token={token}>
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="/dist/main.css" />
          <link rel="stylesheet" href="/dist/patternfly.min.css" />
          <link rel="stylesheet" href="/dist/patternfly-addons.css" />
          <title>SSR base</title>
        </head>
        <body>
          <div style={{ height: '100%' }}>
            <Root />
          </div>
        </body>
      </html>
    </AuthProvider>
  );
};

export default App;

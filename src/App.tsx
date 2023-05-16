import '@patternfly/react-core/dist/styles/base.css';

import React from 'react';
import AuthProvider from './shared/AuthProvider';
import Root from './Routes/Root';

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

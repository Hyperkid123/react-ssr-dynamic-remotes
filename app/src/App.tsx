import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';

import React from 'react';
import AuthProvider from './shared/AuthProvider';
import Root from './Routes/Root';

const App = ({ token, cssAssetMap }: { token?: string; cssAssetMap: string[] }) => {
  return (
    <AuthProvider token={token}>
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {cssAssetMap.map((href, index) => (
            <link key={index} rel="stylesheet" href={href} />
          ))}
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

import React from 'react';
import { ScalprumComponent, ScalprumProvider } from '@scalprum/react-core';
import { getContainer, injectScript } from '@module-federation/utilities';

const PluginSSRComponent = () => {
  const isServer = process.env.IS_SERVER
  return (
    <ScalprumProvider
      config={{
        'sample-plugin': {
          name: 'sample-plugin',
          manifestLocation: isServer ? 'http://localhost:9001/plugin-manifest.server.json'  : 'http://localhost:9001/plugin-manifest.json',
        },
      }}
      pluginSDKOptions={{
        pluginLoaderOptions: {
          injectScript: (url, manifest) => {
            return injectScript({
              url,
              global: manifest.name
            })
          },
          getPluginEntryModule: (manifest) => getContainer(manifest.name),
        },
      }}
    >
      <ScalprumComponent scope="sample-plugin" module="./RemoteComponent" />
    </ScalprumProvider>
  );
};

export default PluginSSRComponent;

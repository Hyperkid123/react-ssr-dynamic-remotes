/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Suspense, lazy, useMemo, useState } from 'react';
import { injectScript } from '@module-federation/utilities';
import { useAuth } from './shared/AuthProvider';
import { ScalprumContext } from '@scalprum/react-core';

// to mock the required context of scalprum
const ScalprumMock: React.FC<React.PropsWithChildren> = ({ children }) => {
  const auth = useAuth();
  const chrome = useMemo(() => {
    const chrome = {
      auth: {
        getUser: () => Promise.resolve({ identity: { user: auth } }),
      },
      isProd: () => false,
    };
    // @ts-expect-error
    global.insights = {
      chrome,
    };
    return chrome;
  }, []);
  return (
    <ScalprumContext.Provider
      // @ts-expect-error
      value={{
        api: {
          chrome,
        },
      }}
    >
      {children}
    </ScalprumContext.Provider>
  );
};

const RemoteComponentLanding = () => {
  const initComponent = async () => {
    // for ssr we need two types of build for remote modules. One for client rendering and one for server rendering.
    const URL = process.env.IS_SERVER ? 'http://localhost:8005/ssr-landing-server.js' : 'http://localhost:8005/ssr-landing.js';

    // similar to what scalprum openshift sdk is doing
    const container = await injectScript({
      global: 'ssrLanding',
      url: URL,
    });
    // get the module
    const factory = await container.get<{ default: React.ComponentType }>('./RootApp');
    return factory();
  };

  // memoize the component as we call the init method in render
  const Cmp = useMemo(() => lazy(async () => await initComponent()), []);
  return (
    <div className="landing">
      <ScalprumMock>
        <Suspense fallback="Loading remote landing SSR compatible component...">
          <Cmp />
        </Suspense>
      </ScalprumMock>
    </div>
  );
};

export default RemoteComponentLanding;

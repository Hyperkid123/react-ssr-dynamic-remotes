/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useMemo, useState } from 'react';
import { ScalprumComponent, ScalprumProvider } from '@scalprum/react-core';
import { useAuth } from '../shared/AuthProvider';

const ClientComponent = () => {
  const auth = useAuth();
  const chrome = useMemo(() => {
    const chrome = {
      auth: {
        getUser: () => Promise.resolve({ identity: { user: auth } }),
      },
      isProd: () => false,
    };
    // @ts-expect-error
    window.insights = {
      chrome,
    };
    return chrome;
  }, []);
  return (
    <ScalprumProvider
      config={{
        landing: {
          name: 'landing',
          manifestLocation: '/apps/landing/fed-mods.json',
        },
      }}
      api={{
        chrome,
      }}
    >
      <div className="landing">
        <ScalprumComponent scope="landing" module="./RootApp" />
      </div>
    </ScalprumProvider>
  );
};

const HCCRemoteComponent = () => {
  const [ClientCmp, setClientCpm] = useState<React.ComponentType | undefined>(undefined);

  useEffect(() => {
    if (!process.env.IS_SERVER) {
      setClientCpm(() => ClientComponent);
    }
  }, []);
  if (ClientCmp) {
    return <ClientCmp />;
  }
  return <div>HCC remote</div>;
};

export default HCCRemoteComponent;

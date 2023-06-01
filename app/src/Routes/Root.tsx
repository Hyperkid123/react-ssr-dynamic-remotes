import React, { Suspense, lazy } from 'react';
import BaseLayout from '../layouts/BaseLayout';
import { Route, Routes } from 'react-router-dom';
import RemoteComponent from '../RemoteComponent';
import HCCRemoteComponent from '../components/HccRemoteComponent';
import RemoteComponentLanding from '../RemoteComponentLanding';
import PluginSSRComponent from '../components/PluginSSRComponent';
const FedModulesList = lazy(() => import('../components/FedModulesList'));

const Root = () => {
  return (
    <BaseLayout>
      <Routes>
        <Route path="/remote/*" element={<RemoteComponent />} />
        <Route path="/sdk/*" element={<PluginSSRComponent />} />
        <Route path="/landing/*" element={<RemoteComponentLanding />} />
        <Route
          path="/suspense-fetch"
          element={
            <Suspense fallback="Loading the list">
              <FedModulesList />
            </Suspense>
          }
        />
        <Route path="/" element={<HCCRemoteComponent />} />
      </Routes>
    </BaseLayout>
  );
};

export default Root;

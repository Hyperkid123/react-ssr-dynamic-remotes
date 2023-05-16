import React from 'react';
import BaseLayout from '../layouts/BaseLayout';
import { Route, Routes } from 'react-router-dom';
import RemoteComponent from '../RemoteComponent';
import HCCRemoteComponent from '../components/HccRemoteComponent';

const Root = () => {
  return (
    <BaseLayout>
      <Routes>
        <Route path="/remote" element={<RemoteComponent />} />
        <Route path="/" element={<HCCRemoteComponent />} />
      </Routes>
    </BaseLayout>
  );
};

export default Root;

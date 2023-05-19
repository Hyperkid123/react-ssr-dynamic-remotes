import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import Cookie from 'js-cookie';
import { initialize } from './shared/axiosInstance';

const token = Cookie.get('poc_auth_code');
if (token) {
  initialize(token);
}

hydrateRoot(
  document,
  <BrowserRouter>
    <App cssAssetMap={window.cssAssetMap} token={token} />
  </BrowserRouter>
);

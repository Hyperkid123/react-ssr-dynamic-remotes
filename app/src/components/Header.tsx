/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
// @ts-expect-error
import logo from '../static/logo.svg';
import { Link } from 'react-router-dom';

import './header.css';

const Header = () => {
  return (
    <header className="pf-c-masthead pf-m-display-inline-on-md">
      <div className="pf-c-masthead__main">
        <img className="pf-c-brand brand" src={logo} alt="RH logo" />
      </div>
      <div className="pf-c-masthead__content">
        <div className="pf-l-flex">
          <h1 className="pf-c-title pf-m-2xl" data-ouia-component-id="a-title">
            SRR | Module federation POC
          </h1>
          <Link to="/">Current HCC remote module</Link>
          <Link to="/landing">SSR build HCC module</Link>
          <Link to="/remote">SSR rendered federated module</Link>
          <Link to="/suspense-fetch">Data fetched using the Suspense model</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

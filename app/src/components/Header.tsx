/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { Brand, Flex, Masthead, MastheadContent, MastheadMain, Title } from '@patternfly/react-core';
// @ts-expect-error
import logo from '../static/logo.svg';
import { Link } from 'react-router-dom';

import './header.css';

const Header = () => {
  return (
    <Masthead>
      <MastheadMain>
        <Brand className="brand" src={logo} alt="RH logo" />
      </MastheadMain>
      <MastheadContent>
        <Flex>
          <Title data-ouia-component-id="a-title" headingLevel="h1">
            SRR | Module federation POC
          </Title>
          <Link to="/">Current HCC remote module</Link>
          <Link to="/landing">SSR build HCC module</Link>
          <Link to="/remote">SSR rendered federated module</Link>
          <Link to="/suspense-fetch">Data fetched using the Suspense model</Link>
        </Flex>
      </MastheadContent>
    </Masthead>
  );
};

export default Header;

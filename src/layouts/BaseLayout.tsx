import { Page, PageSection } from '@patternfly/react-core';
import React from 'react';
import Header from '../components/Header';

const BaseLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Page header={<Header />}>
      <PageSection className="pf-u-p-0">{children}</PageSection>
    </Page>
  );
};

export default BaseLayout;

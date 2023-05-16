import { Page, PageSection } from '@patternfly/react-core';
import React from 'react';

const BaseLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Page>
      <PageSection>{children}</PageSection>
    </Page>
  );
};

export default BaseLayout;

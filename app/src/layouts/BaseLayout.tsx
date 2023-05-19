// import { Page, PageSection } from '@patternfly/react-core';
import React from 'react';
import Header from '../components/Header';

const BaseLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    /**
     * onPageResize={null} is required to disable extra render transition
     * this is likely a bug on PF side
     * the observer triggers Suspense updates before the root is hydrated, causing rendering to fallback to client side
     */
    <div className="pf-c-page">
      <Header />
      <main className="pf-c-page__main">
        <section className="pf-c-page__main-section pf-u-p-0">{children}</section>
      </main>
    </div>
    // <Page onPageResize={null} header={<Header />}>
    //   <PageSection className="pf-u-p-0">{children}</PageSection>
    // </Page>
  );
};

export default BaseLayout;

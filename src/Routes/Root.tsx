import React from 'react';
import BaseLayout from '../layouts/BaseLayout';
import { Button } from '@patternfly/react-core';

const Root = () => {
  return (
    <BaseLayout>
      <div>This will be root</div>
      <Button>A button</Button>
    </BaseLayout>
  );
};

export default Root;

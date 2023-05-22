import React from 'react';
import { suspenseGet } from '../shared/axiosInstance';
import '../some.css';

// Use suspense for data fetching
const resource = suspenseGet('/api/chrome-service/v1/static/beta/stage/modules/fed-modules.json');
const FedModulesList = () => {
  const data = resource();
  return (
    <div className="foo">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default FedModulesList;

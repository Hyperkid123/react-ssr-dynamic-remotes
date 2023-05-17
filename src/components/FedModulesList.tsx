import React from 'react';
// import { suspenseGet } from '../shared/axiosInstance';

console.log(__webpack_share_scopes__.default);

// Use suspense for data fetching
// const resource = suspenseGet('/api/chrome-service/v1/static/beta/stage/modules/fed-modules.json');
const FedModulesList = () => {
  console.log('Render');
  // const data = resource();
  return (
    <div>
      <p>Prdel</p>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
};

export default FedModulesList;

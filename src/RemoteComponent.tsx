/// <reference types="webpack/module" />
import React, { Suspense, lazy, useEffect, useState } from 'react'

const SHARED_SCOPE_NAME = 'default';
const initSharedScope = async () => __webpack_init_sharing__(SHARED_SCOPE_NAME);
const getSharedScope = () => {
  console.log({ __webpack_share_scopes__ })
  if (!Object.keys(__webpack_share_scopes__).includes(SHARED_SCOPE_NAME)) {
    throw new Error('Attempt to access share scope object before its initialization');
  }

  return __webpack_share_scopes__[SHARED_SCOPE_NAME];
};
const injectScriptElement = (url: string, id: string, getDocument = () => document) =>
  new Promise<void>((resolve, reject) => {
    const script = getDocument().createElement('script');

    script.async = true;
    script.src = url;
    script.id = id;

    script.onload = () => {
      resolve();
    };

    script.onerror = (event) => {
      reject(event);
    };

    getDocument().head.appendChild(script);
  });


const RemoteComponent = () => {
  
  const initComponent = async () => {
    // await initSharedScope()
    const sharedScope = getSharedScope()
    await injectScriptElement('http://localhost:8004/ssr-remote.js', 'ssrRemote')
    // @ts-ignore
    await global['ssrRemote'].init(sharedScope)
    // @ts-ignore
    const container = await global['ssrRemote'].get('./RemoteApp')
    console.log('container', { c: container().default })
    return container()
  }

  const Cmp = lazy(() => initComponent())
  // useEffect(() => {
  //   initComponent()
  // }, [])
  return (
    <div>
      This will load remote component
      <Suspense fallback="Loading remote component...">
        <Cmp />
      </Suspense>
    </div>
  )
}

export default RemoteComponent
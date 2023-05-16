import type { RuntimeRemote } from '@module-federation/utilities';

declare module '@module-federation/utilities' {
  export type WebpackRemoteContainer = {
    get<T extends Record<string, any> = Record<string, any>>(module: string): Promise<() => T>;
  };
  // declare function injectScript(a: bool): void
  export function injectScript(keyOrRuntimeRemoteItem: string | RuntimeRemote): Promise<WebpackRemoteContainer>;
}

// allow fake module to be imported
declare module 'fake' {
  type fake = string;
  export default fake;
}

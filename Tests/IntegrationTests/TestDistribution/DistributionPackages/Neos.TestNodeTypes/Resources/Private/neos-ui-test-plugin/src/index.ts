import * as module from './manifest';

// register globally to fetch in e2e tests
(window as any).neosUiTestPlugin = module;

export type NeosUiTestPlugin = typeof module;

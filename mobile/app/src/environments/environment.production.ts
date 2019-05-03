import { commonEnvironment } from './environment.common';

export const environment = {
  ...commonEnvironment,
  production: true,
  apiBaseUrl: 'https://api.tryclicker.com',
  auth0: {
    domain: 'clikr.auth0.com',
    clientId: 'w0ovjOfDoC8PoYGdf6pXTNJEQHqKLDEc',
  },
};

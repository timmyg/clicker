import { commonEnvironment } from './environment.common';

export const environment = {
  ...commonEnvironment,
  production: true,
  apiBaseUrl: 'https://api-release.tryclicker.com',
  auth0: {
    domain: 'clikr-release.auth0.com',
    clientId: 'slvQZ5Na2YGXlPKuedSpVTTH6U0Uo7gi',
  },
};

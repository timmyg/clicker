// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.production.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'https://api-develop.tryclicker.com',
  auth0: {
    domain: 'clikr-develop.auth0.com',
    clientId: 'abgmbT4pqRZROXxn383G4Js0dMMP4bRY',
  },
  intercom: {
    appId: 'lp9l5d9l',
  },
  stripe: {
    publishableKey: 'pk_test_myi1Ch7YjdY7EVMDFWZpfG7g00UYpg47m9',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

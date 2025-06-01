import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://esmm.systeo.tn/realms/systeodigital',
  clientId: 'app-pfeFront',
  redirectUri: window.location.origin,
  responseType: 'code',
  strictDiscoveryDocumentValidation: true,
  scope: 'openid profile roles email',
  requireHttps: true,
  disablePKCE: false, 
  tokenEndpoint: 'https://esmm.systeo.tn/realms/systeodigital/protocol/openid-connect/token',
  showDebugInformation: true,
 customQueryParams: {
    audience: 'app-projectPFE' 
  },
  
};
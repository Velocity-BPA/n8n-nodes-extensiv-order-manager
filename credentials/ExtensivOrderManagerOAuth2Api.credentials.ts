/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ExtensivOrderManagerOAuth2Api implements ICredentialType {
  name = 'extensivOrderManagerOAuth2Api';
  displayName = 'Extensiv Order Manager OAuth2 API';
  documentationUrl = 'https://developer.extensiv.com/';
  icon = 'file:extensivOrderManager.svg' as const;

  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
        },
        {
          name: 'Demo/Sandbox',
          value: 'demo',
        },
      ],
      default: 'production',
      description: 'Select the Extensiv Order Manager environment',
    },
    {
      displayName: 'Client ID (App Key)',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your App Key from the Extensiv Developer Portal',
    },
    {
      displayName: 'Client Secret (App Secret)',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your App Secret from the Extensiv Developer Portal',
    },
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'OAuth2 access token obtained after authorization',
    },
    {
      displayName: 'Refresh Token',
      name: 'refreshToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'OAuth2 refresh token for obtaining new access tokens',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.accessToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.environment === "production" ? "https://api.skubana.com" : "https://api.demo.skubana.com"}}',
      url: '/service/v1.2/orders',
      qs: {
        page: 1,
        pageSize: 1,
      },
    },
  };
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
  IPollFunctions,
  IRequestOptions,
  IWebhookFunctions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

// Licensing notice - logged once per node load
let licensingNoticeLogged = false;

function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
    licensingNoticeLogged = true;
  }
}

type ExtensivContext =
  | IExecuteFunctions
  | ILoadOptionsFunctions
  | IHookFunctions
  | IWebhookFunctions
  | IPollFunctions;

/**
 * Get the base URL for the Extensiv Order Manager API
 */
export function getBaseUrl(environment: string): string {
  return environment === 'production'
    ? 'https://api.skubana.com'
    : 'https://api.demo.skubana.com';
}

/**
 * Get the app base URL for OAuth operations
 */
export function getAppBaseUrl(environment: string): string {
  return environment === 'production'
    ? 'https://app.skubana.com'
    : 'https://demo.skubana.com';
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshAccessToken(
  this: ExtensivContext,
  credentials: IDataObject,
): Promise<string> {
  const clientId = credentials.clientId as string;
  const clientSecret = credentials.clientSecret as string;
  const refreshToken = credentials.refreshToken as string;
  const environment = credentials.environment as string;

  const baseUrl = getAppBaseUrl(environment);
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const options: IRequestOptions = {
    method: 'POST',
    uri: `${baseUrl}/oauth/token`,
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    json: true,
  };

  try {
    const response = await this.helpers.request(options);
    return response.access_token;
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject, {
      message: 'Failed to refresh access token',
    });
  }
}

/**
 * Make an API request to Extensiv Order Manager
 */
export async function extensivApiRequest(
  this: ExtensivContext,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
  uri?: string,
): Promise<IDataObject | IDataObject[]> {
  // Log licensing notice once
  logLicensingNotice();

  const credentials = await this.getCredentials('extensivOrderManagerOAuth2Api');
  const environment = credentials.environment as string;
  const baseUrl = getBaseUrl(environment);

  const options: IRequestOptions = {
    method,
    uri: uri || `${baseUrl}/service/v1.2${endpoint}`,
    headers: {
      Authorization: `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await this.helpers.request(options);
    return response;
  } catch (error: unknown) {
    const errorObj = error as { statusCode?: number; message?: string };

    // Handle token expiration
    if (errorObj.statusCode === 401) {
      try {
        const newToken = await refreshAccessToken.call(this, credentials);
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return await this.helpers.request(options);
      } catch (refreshError) {
        throw new NodeApiError(this.getNode(), refreshError as JsonObject, {
          message: 'Failed to refresh access token. Please re-authenticate.',
        });
      }
    }

    // Handle rate limiting
    if (errorObj.statusCode === 429) {
      throw new NodeApiError(this.getNode(), error as JsonObject, {
        message: 'Rate limit exceeded. Please try again later.',
      });
    }

    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

/**
 * Make an API request and return all items (handles pagination)
 */
export async function extensivApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  propertyName: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let page = 1;
  const pageSize = 100;

  query = query || {};
  query.page = page;
  query.pageSize = pageSize;

  let hasMore = true;

  while (hasMore) {
    const responseData = (await extensivApiRequest.call(
      this,
      method,
      endpoint,
      body,
      query,
    )) as IDataObject;

    const items = (responseData[propertyName] ||
      responseData.data ||
      responseData) as IDataObject[];

    if (Array.isArray(items)) {
      returnData.push(...items);
      hasMore = items.length === pageSize;
    } else {
      hasMore = false;
    }

    page++;
    query.page = page;
  }

  return returnData;
}

/**
 * Handle errors with exponential backoff for rate limiting
 */
export async function extensivApiRequestWithRetry(
  this: ExtensivContext,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
  maxRetries = 5,
): Promise<IDataObject | IDataObject[]> {
  let lastError: Error | null = null;
  let waitTime = 1000; // Start with 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await extensivApiRequest.call(this, method, endpoint, body, query);
    } catch (error: unknown) {
      lastError = error as Error;
      const errorObj = error as { statusCode?: number };

      // Only retry on rate limit errors
      if (errorObj.statusCode !== 429) {
        throw error;
      }

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      waitTime = Math.min(waitTime * 2, 120000); // Max 2 minutes
    }
  }

  throw lastError;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: IDataObject,
  requiredFields: string[],
): void {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Format date to ISO 8601 string
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Build query parameters from additional fields
 */
export function buildQueryFromAdditionalFields(
  additionalFields: IDataObject,
): IDataObject {
  const query: IDataObject = {};

  for (const [key, value] of Object.entries(additionalFields)) {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'dateFrom' || key === 'dateTo' || key === 'modifiedAfter') {
        query[key] = formatDate(value as string);
      } else if (Array.isArray(value)) {
        query[key] = value.join(',');
      } else {
        query[key] = value;
      }
    }
  }

  return query;
}

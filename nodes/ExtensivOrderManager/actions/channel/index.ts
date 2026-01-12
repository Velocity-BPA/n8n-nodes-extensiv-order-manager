/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
  extensivApiRequest,
  extensivApiRequestAllItems,
  buildQueryFromAdditionalFields,
} from '../../transport';
import { cleanObject } from '../../utils';

export const channelOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['channel'],
      },
    },
    options: [
      {
        name: 'Disable',
        value: 'disable',
        description: 'Disable a sales channel',
        action: 'Disable channel',
      },
      {
        name: 'Enable',
        value: 'enable',
        description: 'Enable a sales channel',
        action: 'Enable channel',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a sales channel by ID',
        action: 'Get channel',
      },
      {
        name: 'Get Listings',
        value: 'getListings',
        description: 'Get channel listings',
        action: 'Get channel listings',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple sales channels',
        action: 'Get many channels',
      },
      {
        name: 'Sync',
        value: 'sync',
        description: 'Trigger channel sync',
        action: 'Sync channel',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a sales channel',
        action: 'Update channel',
      },
      {
        name: 'Update Listing',
        value: 'updateListing',
        description: 'Update listing details',
        action: 'Update channel listing',
      },
    ],
    default: 'getAll',
  },
];

export const channelFields: INodeProperties[] = [
  // Get/Update/Enable/Disable/Sync
  {
    displayName: 'Channel ID',
    name: 'channelId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['get', 'update', 'enable', 'disable', 'sync', 'getListings', 'updateListing'],
      },
    },
    description: 'The ID of the sales channel',
  },
  // Update Listing
  {
    displayName: 'Listing ID',
    name: 'listingId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['updateListing'],
      },
    },
    description: 'The ID of the listing to update',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['getAll', 'getListings'],
      },
    },
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['getAll', 'getListings'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    description: 'Max number of results to return',
  },
  // Listing Update Fields
  {
    displayName: 'Listing Fields',
    name: 'listingFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['updateListing'],
      },
    },
    options: [
      {
        displayName: 'Price',
        name: 'price',
        type: 'number',
        default: 0,
        description: 'Listing price',
      },
      {
        displayName: 'Quantity',
        name: 'quantity',
        type: 'number',
        default: 0,
        description: 'Available quantity',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Active', value: 'Active' },
          { name: 'Inactive', value: 'Inactive' },
        ],
        default: 'Active',
        description: 'Listing status',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Listing title',
      },
    ],
  },
  // Additional Fields
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['getAll', 'update'],
      },
    },
    options: [
      {
        displayName: 'Is Active',
        name: 'isActive',
        type: 'boolean',
        default: true,
        description: 'Whether the channel is active',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Channel name',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Active', value: 'Active' },
          { name: 'Inactive', value: 'Inactive' },
          { name: 'Error', value: 'Error' },
        ],
        default: 'Active',
        description: 'Filter by channel status',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Amazon', value: 'Amazon' },
          { name: 'eBay', value: 'eBay' },
          { name: 'Shopify', value: 'Shopify' },
          { name: 'WooCommerce', value: 'WooCommerce' },
          { name: 'Walmart', value: 'Walmart' },
          { name: 'Manual', value: 'Manual' },
        ],
        default: 'Shopify',
        description: 'Filter by channel type',
      },
    ],
  },
  // Sync Options
  {
    displayName: 'Sync Options',
    name: 'syncOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['sync'],
      },
    },
    options: [
      {
        displayName: 'Sync Inventory',
        name: 'syncInventory',
        type: 'boolean',
        default: true,
        description: 'Whether to sync inventory',
      },
      {
        displayName: 'Sync Orders',
        name: 'syncOrders',
        type: 'boolean',
        default: true,
        description: 'Whether to sync orders',
      },
      {
        displayName: 'Sync Prices',
        name: 'syncPrices',
        type: 'boolean',
        default: false,
        description: 'Whether to sync prices',
      },
    ],
  },
];

export async function executeChannel(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const channelId = this.getNodeParameter('channelId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/channels/${channelId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/channels',
        'data',
        {},
        query,
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query.pageSize = limit;
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        '/channels',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'update') {
    const channelId = this.getNodeParameter('channelId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const body = cleanObject({ ...additionalFields });
    responseData = await extensivApiRequest.call(this, 'PUT', `/channels/${channelId}`, body);
  }

  if (operation === 'enable') {
    const channelId = this.getNodeParameter('channelId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/channels/${channelId}/enable`);
  }

  if (operation === 'disable') {
    const channelId = this.getNodeParameter('channelId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/channels/${channelId}/disable`);
  }

  if (operation === 'sync') {
    const channelId = this.getNodeParameter('channelId', i) as number;
    const syncOptions = this.getNodeParameter('syncOptions', i) as IDataObject;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/channels/${channelId}/sync`,
      syncOptions,
    );
  }

  if (operation === 'getListings') {
    const channelId = this.getNodeParameter('channelId', i) as number;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        `/channels/${channelId}/listings`,
        'data',
        {},
        {},
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        `/channels/${channelId}/listings`,
        {},
        { pageSize: limit },
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'updateListing') {
    const channelId = this.getNodeParameter('channelId', i) as number;
    const listingId = this.getNodeParameter('listingId', i) as number;
    const listingFields = this.getNodeParameter('listingFields', i) as IDataObject;
    const body = cleanObject({ ...listingFields });
    responseData = await extensivApiRequest.call(
      this,
      'PUT',
      `/channels/${channelId}/listings/${listingId}`,
      body,
    );
  }

  return responseData;
}

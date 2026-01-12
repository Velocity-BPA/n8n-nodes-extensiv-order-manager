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

export const listingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['listing'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new listing',
        action: 'Create listing',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a listing',
        action: 'Delete listing',
      },
      {
        name: 'Disable',
        value: 'disable',
        description: 'Disable a listing',
        action: 'Disable listing',
      },
      {
        name: 'Enable',
        value: 'enable',
        description: 'Enable a listing',
        action: 'Enable listing',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a listing by ID',
        action: 'Get listing',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple listings',
        action: 'Get many listings',
      },
      {
        name: 'Sync Inventory',
        value: 'syncInventory',
        description: 'Sync listing inventory',
        action: 'Sync listing inventory',
      },
      {
        name: 'Sync Price',
        value: 'syncPrice',
        description: 'Sync listing price',
        action: 'Sync listing price',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a listing',
        action: 'Update listing',
      },
    ],
    default: 'getAll',
  },
];

export const listingFields: INodeProperties[] = [
  // Get/Update/Delete/Enable/Disable/Sync
  {
    displayName: 'Listing ID',
    name: 'listingId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['listing'],
        operation: [
          'get',
          'update',
          'delete',
          'enable',
          'disable',
          'syncInventory',
          'syncPrice',
        ],
      },
    },
    description: 'The ID of the listing',
  },
  // Create
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['listing'],
        operation: ['create'],
      },
    },
    description: 'The ID of the product',
  },
  {
    displayName: 'Channel ID',
    name: 'channelId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['listing'],
        operation: ['create'],
      },
    },
    description: 'The ID of the sales channel',
  },
  {
    displayName: 'Listing SKU',
    name: 'listingSku',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['listing'],
        operation: ['create'],
      },
    },
    description: 'Channel-specific SKU',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['listing'],
        operation: ['getAll'],
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
        resource: ['listing'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    description: 'Max number of results to return',
  },
  // Sync Price
  {
    displayName: 'Price',
    name: 'price',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['listing'],
        operation: ['syncPrice'],
      },
    },
    description: 'The price to sync',
  },
  // Sync Inventory
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['listing'],
        operation: ['syncInventory'],
      },
    },
    description: 'The inventory quantity to sync',
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
        resource: ['listing'],
        operation: ['create', 'update', 'getAll'],
      },
    },
    options: [
      {
        displayName: 'Channel ID',
        name: 'channelId',
        type: 'number',
        default: 0,
        description: 'Filter by channel ID',
      },
      {
        displayName: 'Listing SKU',
        name: 'listingSku',
        type: 'string',
        default: '',
        description: 'Channel-specific SKU',
      },
      {
        displayName: 'Price',
        name: 'price',
        type: 'number',
        default: 0,
        description: 'Listing price',
      },
      {
        displayName: 'Product ID',
        name: 'productId',
        type: 'number',
        default: 0,
        description: 'Filter by product ID',
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
          { name: 'Out of Stock', value: 'OutOfStock' },
          { name: 'Error', value: 'Error' },
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
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'Listing URL',
      },
    ],
  },
];

export async function executeListing(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const listingId = this.getNodeParameter('listingId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/listings/${listingId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/listings',
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
        '/listings',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const productId = this.getNodeParameter('productId', i) as number;
    const channelId = this.getNodeParameter('channelId', i) as number;
    const listingSku = this.getNodeParameter('listingSku', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      productId,
      channelId,
      listingSku,
      ...additionalFields,
    });

    responseData = await extensivApiRequest.call(this, 'POST', '/listings', body);
  }

  if (operation === 'update') {
    const listingId = this.getNodeParameter('listingId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const body = cleanObject({ ...additionalFields });
    responseData = await extensivApiRequest.call(this, 'PUT', `/listings/${listingId}`, body);
  }

  if (operation === 'delete') {
    const listingId = this.getNodeParameter('listingId', i) as number;
    responseData = await extensivApiRequest.call(this, 'DELETE', `/listings/${listingId}`);
  }

  if (operation === 'enable') {
    const listingId = this.getNodeParameter('listingId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/listings/${listingId}/enable`);
  }

  if (operation === 'disable') {
    const listingId = this.getNodeParameter('listingId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/listings/${listingId}/disable`);
  }

  if (operation === 'syncInventory') {
    const listingId = this.getNodeParameter('listingId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/listings/${listingId}/sync-inventory`,
      { quantity },
    );
  }

  if (operation === 'syncPrice') {
    const listingId = this.getNodeParameter('listingId', i) as number;
    const price = this.getNodeParameter('price', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/listings/${listingId}/sync-price`,
      { price },
    );
  }

  return responseData;
}

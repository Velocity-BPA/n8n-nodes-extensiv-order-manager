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

export const returnOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['return'],
      },
    },
    options: [
      {
        name: 'Approve',
        value: 'approve',
        description: 'Approve a return',
        action: 'Approve return',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a return',
        action: 'Cancel return',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a return/RMA',
        action: 'Create return',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a return by ID',
        action: 'Get return',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple returns',
        action: 'Get many returns',
      },
      {
        name: 'Process',
        value: 'process',
        description: 'Process refund/exchange',
        action: 'Process return',
      },
      {
        name: 'Receive',
        value: 'receive',
        description: 'Receive returned items',
        action: 'Receive return',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update return details',
        action: 'Update return',
      },
    ],
    default: 'getAll',
  },
];

export const returnFields: INodeProperties[] = [
  // Get/Update/Approve/Receive/Process/Cancel
  {
    displayName: 'Return ID',
    name: 'returnId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['return'],
        operation: ['get', 'update', 'approve', 'receive', 'process', 'cancel'],
      },
    },
    description: 'The ID of the return',
  },
  // Create
  {
    displayName: 'Order ID',
    name: 'orderId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['return'],
        operation: ['create'],
      },
    },
    description: 'The ID of the original order',
  },
  {
    displayName: 'Reason',
    name: 'reason',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['return'],
        operation: ['create'],
      },
    },
    description: 'Reason for the return',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['return'],
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
        resource: ['return'],
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
  // Return Items
  {
    displayName: 'Return Items',
    name: 'items',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Item',
    default: {},
    displayOptions: {
      show: {
        resource: ['return'],
        operation: ['create', 'receive'],
      },
    },
    options: [
      {
        name: 'itemValues',
        displayName: 'Item',
        values: [
          {
            displayName: 'Product ID',
            name: 'productId',
            type: 'number',
            default: 0,
            description: 'The ID of the product',
          },
          {
            displayName: 'Quantity',
            name: 'quantity',
            type: 'number',
            default: 1,
            description: 'Number of items to return',
          },
          {
            displayName: 'Condition',
            name: 'condition',
            type: 'options',
            options: [
              { name: 'New', value: 'New' },
              { name: 'Like New', value: 'LikeNew' },
              { name: 'Used', value: 'Used' },
              { name: 'Damaged', value: 'Damaged' },
            ],
            default: 'New',
            description: 'Condition of returned item',
          },
        ],
      },
    ],
    description: 'Items being returned',
  },
  // Process Options
  {
    displayName: 'Process Options',
    name: 'processOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['return'],
        operation: ['process'],
      },
    },
    options: [
      {
        displayName: 'Refund Amount',
        name: 'refundAmount',
        type: 'number',
        default: 0,
        description: 'Amount to refund',
      },
      {
        displayName: 'Restock Items',
        name: 'restockItems',
        type: 'boolean',
        default: true,
        description: 'Whether to restock the returned items',
      },
      {
        displayName: 'Return Type',
        name: 'returnType',
        type: 'options',
        options: [
          { name: 'Refund', value: 'Refund' },
          { name: 'Exchange', value: 'Exchange' },
          { name: 'Store Credit', value: 'StoreCredit' },
        ],
        default: 'Refund',
        description: 'Type of return resolution',
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
        resource: ['return'],
        operation: ['create', 'update', 'getAll'],
      },
    },
    options: [
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes',
      },
      {
        displayName: 'Order ID',
        name: 'orderId',
        type: 'number',
        default: 0,
        description: 'Filter by order ID',
      },
      {
        displayName: 'Reason',
        name: 'reason',
        type: 'string',
        default: '',
        description: 'Return reason',
      },
      {
        displayName: 'Refund Amount',
        name: 'refundAmount',
        type: 'number',
        default: 0,
        description: 'Expected refund amount',
      },
      {
        displayName: 'Return Type',
        name: 'returnType',
        type: 'options',
        options: [
          { name: 'Refund', value: 'Refund' },
          { name: 'Exchange', value: 'Exchange' },
          { name: 'Store Credit', value: 'StoreCredit' },
        ],
        default: 'Refund',
        description: 'Type of return',
      },
      {
        displayName: 'RMA Number',
        name: 'rmaNumber',
        type: 'string',
        default: '',
        description: 'RMA reference number',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Requested', value: 'Requested' },
          { name: 'Approved', value: 'Approved' },
          { name: 'Received', value: 'Received' },
          { name: 'Processed', value: 'Processed' },
          { name: 'Cancelled', value: 'Cancelled' },
        ],
        default: 'Requested',
        description: 'Filter by return status',
      },
    ],
  },
];

export async function executeReturn(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const returnId = this.getNodeParameter('returnId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/returns/${returnId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/returns',
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
        '/returns',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const reason = this.getNodeParameter('reason', i) as string;
    const items = this.getNodeParameter('items', i) as IDataObject;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      orderId,
      reason,
      ...additionalFields,
    });

    if (items.itemValues && Array.isArray(items.itemValues)) {
      body.items = items.itemValues;
    }

    responseData = await extensivApiRequest.call(this, 'POST', '/returns', body);
  }

  if (operation === 'update') {
    const returnId = this.getNodeParameter('returnId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const body = cleanObject({ ...additionalFields });
    responseData = await extensivApiRequest.call(this, 'PUT', `/returns/${returnId}`, body);
  }

  if (operation === 'approve') {
    const returnId = this.getNodeParameter('returnId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/returns/${returnId}/approve`);
  }

  if (operation === 'receive') {
    const returnId = this.getNodeParameter('returnId', i) as number;
    const items = this.getNodeParameter('items', i) as IDataObject;

    const body: IDataObject = {};
    if (items.itemValues && Array.isArray(items.itemValues)) {
      body.items = items.itemValues;
    }

    responseData = await extensivApiRequest.call(this, 'POST', `/returns/${returnId}/receive`, body);
  }

  if (operation === 'process') {
    const returnId = this.getNodeParameter('returnId', i) as number;
    const processOptions = this.getNodeParameter('processOptions', i) as IDataObject;
    const body = cleanObject({ ...processOptions });
    responseData = await extensivApiRequest.call(this, 'POST', `/returns/${returnId}/process`, body);
  }

  if (operation === 'cancel') {
    const returnId = this.getNodeParameter('returnId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/returns/${returnId}/cancel`);
  }

  return responseData;
}

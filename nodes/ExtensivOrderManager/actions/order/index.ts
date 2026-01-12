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
import { cleanObject, parseAddress, parseLineItems } from '../../utils';

export const orderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['order'],
      },
    },
    options: [
      {
        name: 'Add Note',
        value: 'addNote',
        description: 'Add a note to an order',
        action: 'Add note to order',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel an order',
        action: 'Cancel order',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new order',
        action: 'Create order',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve an order by ID',
        action: 'Get order',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple orders',
        action: 'Get many orders',
      },
      {
        name: 'Get Shipments',
        value: 'getShipments',
        description: 'Get shipments for an order',
        action: 'Get order shipments',
      },
      {
        name: 'Merge',
        value: 'merge',
        description: 'Merge multiple orders',
        action: 'Merge orders',
      },
      {
        name: 'Send to Fulfillment',
        value: 'sendToFulfillment',
        description: 'Send order to fulfillment',
        action: 'Send order to fulfillment',
      },
      {
        name: 'Ship',
        value: 'ship',
        description: 'Mark order as shipped',
        action: 'Ship order',
      },
      {
        name: 'Split',
        value: 'split',
        description: 'Split order into multiple orders',
        action: 'Split order',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an order',
        action: 'Update order',
      },
      {
        name: 'Update Status',
        value: 'updateStatus',
        description: 'Update order status',
        action: 'Update order status',
      },
      {
        name: 'Update Tracking',
        value: 'updateTracking',
        description: 'Update tracking information',
        action: 'Update order tracking',
      },
    ],
    default: 'getAll',
  },
];

export const orderFields: INodeProperties[] = [
  // Get operation
  {
    displayName: 'Order ID',
    name: 'orderId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['order'],
        operation: [
          'get',
          'update',
          'cancel',
          'ship',
          'updateTracking',
          'addNote',
          'getShipments',
          'sendToFulfillment',
          'updateStatus',
          'split',
        ],
      },
    },
    description: 'The ID of the order',
  },
  // Create operation
  {
    displayName: 'Order Number',
    name: 'orderNumber',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['create'],
      },
    },
    description: 'External order number',
  },
  {
    displayName: 'Channel ID',
    name: 'channelId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['create'],
      },
    },
    description: 'The sales channel ID',
  },
  // GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['order'],
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
        resource: ['order'],
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
  // Update Status
  {
    displayName: 'Status',
    name: 'status',
    type: 'options',
    required: true,
    default: 'Processing',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['updateStatus'],
      },
    },
    options: [
      { name: 'Awaiting', value: 'Awaiting' },
      { name: 'Processing', value: 'Processing' },
      { name: 'Shipped', value: 'Shipped' },
      { name: 'Delivered', value: 'Delivered' },
      { name: 'Cancelled', value: 'Cancelled' },
    ],
    description: 'The new order status',
  },
  // Add Note
  {
    displayName: 'Note',
    name: 'note',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['addNote'],
      },
    },
    typeOptions: {
      rows: 3,
    },
    description: 'The note to add to the order',
  },
  // Update Tracking
  {
    displayName: 'Tracking Number',
    name: 'trackingNumber',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['updateTracking', 'ship'],
      },
    },
    description: 'The tracking number',
  },
  {
    displayName: 'Carrier',
    name: 'carrier',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['updateTracking', 'ship'],
      },
    },
    description: 'The shipping carrier (e.g., UPS, FedEx, USPS)',
  },
  // Merge
  {
    displayName: 'Order IDs',
    name: 'orderIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['merge'],
      },
    },
    description: 'Comma-separated list of order IDs to merge',
  },
  // Split
  {
    displayName: 'Line Item IDs',
    name: 'lineItemIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['split'],
      },
    },
    description: 'Comma-separated list of line item IDs to split into a new order',
  },
  // Additional Fields for Create/Update
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['create', 'update', 'getAll'],
      },
    },
    options: [
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'number',
        default: 0,
        description: 'The customer ID',
      },
      {
        displayName: 'Date From',
        name: 'dateFrom',
        type: 'dateTime',
        default: '',
        description: 'Filter orders from this date',
      },
      {
        displayName: 'Date To',
        name: 'dateTo',
        type: 'dateTime',
        default: '',
        description: 'Filter orders up to this date',
      },
      {
        displayName: 'Modified After',
        name: 'modifiedAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter orders modified after this date',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Order notes',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          { name: 'Low', value: 'Low' },
          { name: 'Normal', value: 'Normal' },
          { name: 'High', value: 'High' },
          { name: 'Critical', value: 'Critical' },
        ],
        default: 'Normal',
        description: 'Order priority',
      },
      {
        displayName: 'Ship By Date',
        name: 'shipByDate',
        type: 'dateTime',
        default: '',
        description: 'Required ship date',
      },
      {
        displayName: 'Shipping Method',
        name: 'shippingMethod',
        type: 'string',
        default: '',
        description: 'Shipping service/method',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Awaiting', value: 'Awaiting' },
          { name: 'Processing', value: 'Processing' },
          { name: 'Shipped', value: 'Shipped' },
          { name: 'Delivered', value: 'Delivered' },
          { name: 'Cancelled', value: 'Cancelled' },
        ],
        default: 'Awaiting',
        description: 'Order status',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Warehouse ID',
        name: 'warehouseId',
        type: 'number',
        default: 0,
        description: 'Assigned warehouse ID',
      },
    ],
  },
  // Shipping Address
  {
    displayName: 'Shipping Address',
    name: 'shippingAddress',
    type: 'collection',
    placeholder: 'Add Address Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Street 1',
        name: 'street1',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Street 2',
        name: 'street2',
        type: 'string',
        default: '',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Postal Code',
        name: 'postalCode',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
      },
    ],
  },
  // Line Items
  {
    displayName: 'Line Items',
    name: 'lineItems',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Line Item',
    default: {},
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Item',
        name: 'item',
        values: [
          {
            displayName: 'Product ID',
            name: 'productId',
            type: 'number',
            default: 0,
          },
          {
            displayName: 'SKU',
            name: 'sku',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Quantity',
            name: 'quantity',
            type: 'number',
            default: 1,
          },
          {
            displayName: 'Unit Price',
            name: 'unitPrice',
            type: 'number',
            default: 0,
          },
        ],
      },
    ],
  },
];

export async function executeOrder(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/orders/${orderId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(this, 'GET', '/orders', 'data', {}, query);
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query.pageSize = limit;
      const response = (await extensivApiRequest.call(this, 'GET', '/orders', {}, query)) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const orderNumber = this.getNodeParameter('orderNumber', i) as string;
    const channelId = this.getNodeParameter('channelId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const shippingAddress = this.getNodeParameter('shippingAddress', i) as IDataObject;
    const lineItemsData = this.getNodeParameter('lineItems', i) as IDataObject;

    const body: IDataObject = cleanObject({
      orderNumber,
      channelId,
      ...additionalFields,
    });

    if (Object.keys(shippingAddress).length > 0) {
      body.shippingAddress = parseAddress(shippingAddress);
    }

    if (lineItemsData.item) {
      body.lineItems = parseLineItems(lineItemsData.item as IDataObject[]);
    }

    if (additionalFields.tags) {
      body.tags = (additionalFields.tags as string).split(',').map((t) => t.trim());
    }

    responseData = await extensivApiRequest.call(this, 'POST', '/orders', body);
  }

  if (operation === 'update') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const shippingAddress = this.getNodeParameter('shippingAddress', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    if (Object.keys(shippingAddress).length > 0) {
      body.shippingAddress = parseAddress(shippingAddress);
    }

    if (additionalFields.tags) {
      body.tags = (additionalFields.tags as string).split(',').map((t) => t.trim());
    }

    responseData = await extensivApiRequest.call(this, 'PUT', `/orders/${orderId}`, body);
  }

  if (operation === 'cancel') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/orders/${orderId}/cancel`);
  }

  if (operation === 'ship') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const trackingNumber = this.getNodeParameter('trackingNumber', i) as string;
    const carrier = this.getNodeParameter('carrier', i) as string;

    responseData = await extensivApiRequest.call(this, 'POST', `/orders/${orderId}/ship`, {
      trackingNumber,
      carrier,
    });
  }

  if (operation === 'updateTracking') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const trackingNumber = this.getNodeParameter('trackingNumber', i) as string;
    const carrier = this.getNodeParameter('carrier', i) as string;

    responseData = await extensivApiRequest.call(this, 'PUT', `/orders/${orderId}/tracking`, {
      trackingNumber,
      carrier,
    });
  }

  if (operation === 'addNote') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const note = this.getNodeParameter('note', i) as string;

    responseData = await extensivApiRequest.call(this, 'POST', `/orders/${orderId}/notes`, {
      note,
    });
  }

  if (operation === 'getShipments') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/orders/${orderId}/shipments`);
  }

  if (operation === 'sendToFulfillment') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/orders/${orderId}/fulfill`);
  }

  if (operation === 'updateStatus') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const status = this.getNodeParameter('status', i) as string;

    responseData = await extensivApiRequest.call(this, 'PUT', `/orders/${orderId}/status`, {
      status,
    });
  }

  if (operation === 'split') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const lineItemIds = this.getNodeParameter('lineItemIds', i) as string;

    responseData = await extensivApiRequest.call(this, 'POST', `/orders/${orderId}/split`, {
      lineItemIds: lineItemIds.split(',').map((id) => parseInt(id.trim(), 10)),
    });
  }

  if (operation === 'merge') {
    const orderIds = this.getNodeParameter('orderIds', i) as string;

    responseData = await extensivApiRequest.call(this, 'POST', '/orders/merge', {
      orderIds: orderIds.split(',').map((id) => parseInt(id.trim(), 10)),
    });
  }

  return responseData;
}

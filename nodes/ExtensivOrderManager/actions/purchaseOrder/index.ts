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

export const purchaseOrderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
      },
    },
    options: [
      {
        name: 'Add Item',
        value: 'addItem',
        description: 'Add item to purchase order',
        action: 'Add item to purchase order',
      },
      {
        name: 'Approve',
        value: 'approve',
        description: 'Approve a purchase order',
        action: 'Approve purchase order',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a purchase order',
        action: 'Cancel purchase order',
      },
      {
        name: 'Close',
        value: 'close',
        description: 'Close a purchase order',
        action: 'Close purchase order',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new purchase order',
        action: 'Create purchase order',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a purchase order by ID',
        action: 'Get purchase order',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple purchase orders',
        action: 'Get many purchase orders',
      },
      {
        name: 'Receive',
        value: 'receive',
        description: 'Receive items against purchase order',
        action: 'Receive purchase order items',
      },
      {
        name: 'Remove Item',
        value: 'removeItem',
        description: 'Remove item from purchase order',
        action: 'Remove item from purchase order',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a purchase order',
        action: 'Update purchase order',
      },
    ],
    default: 'getAll',
  },
];

export const purchaseOrderFields: INodeProperties[] = [
  // Get/Update/Cancel/Close/Approve/Receive
  {
    displayName: 'Purchase Order ID',
    name: 'purchaseOrderId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: [
          'get',
          'update',
          'cancel',
          'close',
          'approve',
          'receive',
          'addItem',
          'removeItem',
        ],
      },
    },
    description: 'The ID of the purchase order',
  },
  // Create
  {
    displayName: 'PO Number',
    name: 'poNumber',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['create'],
      },
    },
    description: 'Purchase order reference number',
  },
  {
    displayName: 'Vendor ID',
    name: 'vendorId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['create'],
      },
    },
    description: 'The vendor/supplier ID',
  },
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['create'],
      },
    },
    description: 'The receiving warehouse ID',
  },
  // Add Item
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['addItem'],
      },
    },
    description: 'The product ID to add',
  },
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'number',
    required: true,
    default: 1,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['addItem'],
      },
    },
    description: 'The quantity to order',
  },
  // Remove Item
  {
    displayName: 'Line Item ID',
    name: 'lineItemId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['removeItem'],
      },
    },
    description: 'The line item ID to remove',
  },
  // Receive
  {
    displayName: 'Received Items',
    name: 'receivedItems',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Received Item',
    default: {},
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['receive'],
      },
    },
    options: [
      {
        displayName: 'Item',
        name: 'item',
        values: [
          {
            displayName: 'Line Item ID',
            name: 'lineItemId',
            type: 'number',
            default: 0,
          },
          {
            displayName: 'Quantity Received',
            name: 'quantityReceived',
            type: 'number',
            default: 0,
          },
        ],
      },
    ],
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
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
        resource: ['purchaseOrder'],
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
  // Additional Fields
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['purchaseOrder'],
        operation: ['create', 'update', 'getAll', 'addItem'],
      },
    },
    options: [
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'string',
        default: 'USD',
        description: 'Currency code',
      },
      {
        displayName: 'Expected Date',
        name: 'expectedDate',
        type: 'dateTime',
        default: '',
        description: 'Expected arrival date',
      },
      {
        displayName: 'Modified After',
        name: 'modifiedAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter POs modified after this date',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Purchase order notes',
      },
      {
        displayName: 'Order Date',
        name: 'orderDate',
        type: 'dateTime',
        default: '',
        description: 'Date ordered',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'Draft' },
          { name: 'Pending', value: 'Pending' },
          { name: 'Approved', value: 'Approved' },
          { name: 'Ordered', value: 'Ordered' },
          { name: 'Receiving', value: 'Receiving' },
          { name: 'Closed', value: 'Closed' },
          { name: 'Cancelled', value: 'Cancelled' },
        ],
        default: 'Draft',
        description: 'Purchase order status',
      },
      {
        displayName: 'Unit Cost',
        name: 'unitCost',
        type: 'number',
        default: 0,
        description: 'Unit cost for item',
      },
      {
        displayName: 'Vendor ID',
        name: 'vendorId',
        type: 'number',
        default: 0,
        description: 'Filter by vendor ID',
      },
      {
        displayName: 'Warehouse ID',
        name: 'warehouseId',
        type: 'number',
        default: 0,
        description: 'Filter by warehouse ID',
      },
    ],
  },
  // Line Items for Create
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
        resource: ['purchaseOrder'],
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
            displayName: 'Unit Cost',
            name: 'unitCost',
            type: 'number',
            default: 0,
          },
        ],
      },
    ],
  },
];

export async function executePurchaseOrder(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/purchaseorders/${purchaseOrderId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/purchaseorders',
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
        '/purchaseorders',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const poNumber = this.getNodeParameter('poNumber', i) as string;
    const vendorId = this.getNodeParameter('vendorId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const lineItemsData = this.getNodeParameter('lineItems', i) as IDataObject;

    const body: IDataObject = cleanObject({
      poNumber,
      vendorId,
      warehouseId,
      ...additionalFields,
    });

    if (lineItemsData.item) {
      body.lineItems = lineItemsData.item;
    }

    responseData = await extensivApiRequest.call(this, 'POST', '/purchaseorders', body);
  }

  if (operation === 'update') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    responseData = await extensivApiRequest.call(
      this,
      'PUT',
      `/purchaseorders/${purchaseOrderId}`,
      body,
    );
  }

  if (operation === 'cancel') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/purchaseorders/${purchaseOrderId}/cancel`,
    );
  }

  if (operation === 'close') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/purchaseorders/${purchaseOrderId}/close`,
    );
  }

  if (operation === 'approve') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/purchaseorders/${purchaseOrderId}/approve`,
    );
  }

  if (operation === 'receive') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    const receivedItemsData = this.getNodeParameter('receivedItems', i) as IDataObject;

    const items = (receivedItemsData.item as IDataObject[]) || [];

    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/purchaseorders/${purchaseOrderId}/receive`,
      { items },
    );
  }

  if (operation === 'addItem') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    const productId = this.getNodeParameter('productId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      productId,
      quantity,
      ...additionalFields,
    });

    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/purchaseorders/${purchaseOrderId}/items`,
      body,
    );
  }

  if (operation === 'removeItem') {
    const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
    const lineItemId = this.getNodeParameter('lineItemId', i) as number;

    responseData = await extensivApiRequest.call(
      this,
      'DELETE',
      `/purchaseorders/${purchaseOrderId}/items/${lineItemId}`,
    );
  }

  return responseData;
}

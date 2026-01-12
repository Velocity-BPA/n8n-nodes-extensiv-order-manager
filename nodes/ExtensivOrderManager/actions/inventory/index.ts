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

export const inventoryOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['inventory'],
      },
    },
    options: [
      {
        name: 'Acknowledge',
        value: 'acknowledge',
        description: 'Acknowledge inventory changes',
        action: 'Acknowledge inventory changes',
      },
      {
        name: 'Adjust',
        value: 'adjust',
        description: 'Make inventory adjustment',
        action: 'Adjust inventory',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get inventory by product/location',
        action: 'Get inventory',
      },
      {
        name: 'Get History',
        value: 'getHistory',
        description: 'Get inventory history',
        action: 'Get inventory history',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'List all inventory',
        action: 'Get many inventory records',
      },
      {
        name: 'Reserve',
        value: 'reserve',
        description: 'Reserve inventory',
        action: 'Reserve inventory',
      },
      {
        name: 'Transfer',
        value: 'transfer',
        description: 'Transfer inventory between locations',
        action: 'Transfer inventory',
      },
      {
        name: 'Unreserve',
        value: 'unreserve',
        description: 'Release reserved inventory',
        action: 'Unreserve inventory',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update inventory quantity',
        action: 'Update inventory',
      },
    ],
    default: 'getAll',
  },
];

export const inventoryFields: INodeProperties[] = [
  // Get/Update/Adjust
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['get', 'update', 'adjust', 'reserve', 'unreserve', 'getHistory', 'transfer'],
      },
    },
    description: 'The product ID',
  },
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['get', 'update', 'adjust', 'reserve', 'unreserve', 'transfer'],
      },
    },
    description: 'The warehouse ID',
  },
  // Update/Adjust quantity
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['update', 'adjust', 'reserve', 'unreserve', 'transfer'],
      },
    },
    description: 'The quantity',
  },
  // Adjust reason
  {
    displayName: 'Reason',
    name: 'reason',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjust'],
      },
    },
    description: 'Reason for the adjustment',
  },
  // Transfer destination
  {
    displayName: 'Destination Warehouse ID',
    name: 'destinationWarehouseId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['transfer'],
      },
    },
    description: 'The destination warehouse ID for the transfer',
  },
  // Acknowledge
  {
    displayName: 'Acknowledgment IDs',
    name: 'acknowledgmentIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['acknowledge'],
      },
    },
    description: 'Comma-separated list of inventory change IDs to acknowledge',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['getAll', 'getHistory'],
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
        resource: ['inventory'],
        operation: ['getAll', 'getHistory'],
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
        resource: ['inventory'],
        operation: ['getAll', 'getHistory', 'update'],
      },
    },
    options: [
      {
        displayName: 'Date From',
        name: 'dateFrom',
        type: 'dateTime',
        default: '',
        description: 'Filter from this date',
      },
      {
        displayName: 'Date To',
        name: 'dateTo',
        type: 'dateTime',
        default: '',
        description: 'Filter to this date',
      },
      {
        displayName: 'Max Stock',
        name: 'maxStock',
        type: 'number',
        default: 0,
        description: 'Maximum stock level',
      },
      {
        displayName: 'Min Stock',
        name: 'minStock',
        type: 'number',
        default: 0,
        description: 'Minimum stock level',
      },
      {
        displayName: 'Modified After',
        name: 'modifiedAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter records modified after this date',
      },
      {
        displayName: 'Product ID',
        name: 'productId',
        type: 'number',
        default: 0,
        description: 'Filter by product ID',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'Filter by SKU',
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
];

export async function executeInventory(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const productId = this.getNodeParameter('productId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;

    responseData = await extensivApiRequest.call(
      this,
      'GET',
      `/inventory/product/${productId}/warehouse/${warehouseId}`,
    );
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/inventory',
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
        '/inventory',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'update') {
    const productId = this.getNodeParameter('productId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      productId,
      warehouseId,
      quantity,
      ...additionalFields,
    });

    responseData = await extensivApiRequest.call(this, 'PUT', '/inventory', body);
  }

  if (operation === 'adjust') {
    const productId = this.getNodeParameter('productId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;
    const reason = this.getNodeParameter('reason', i) as string;

    responseData = await extensivApiRequest.call(this, 'POST', '/inventory/adjust', {
      productId,
      warehouseId,
      adjustmentQuantity: quantity,
      reason,
    });
  }

  if (operation === 'acknowledge') {
    const acknowledgmentIds = this.getNodeParameter('acknowledgmentIds', i) as string;

    responseData = await extensivApiRequest.call(this, 'POST', '/inventory/acknowledge', {
      ids: acknowledgmentIds.split(',').map((id) => parseInt(id.trim(), 10)),
    });
  }

  if (operation === 'getHistory') {
    const productId = this.getNodeParameter('productId', i) as number;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        `/inventory/${productId}/history`,
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
        `/inventory/${productId}/history`,
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'reserve') {
    const productId = this.getNodeParameter('productId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;

    responseData = await extensivApiRequest.call(this, 'POST', '/inventory/reserve', {
      productId,
      warehouseId,
      quantity,
    });
  }

  if (operation === 'unreserve') {
    const productId = this.getNodeParameter('productId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;

    responseData = await extensivApiRequest.call(this, 'POST', '/inventory/unreserve', {
      productId,
      warehouseId,
      quantity,
    });
  }

  if (operation === 'transfer') {
    const productId = this.getNodeParameter('productId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const destinationWarehouseId = this.getNodeParameter('destinationWarehouseId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;

    responseData = await extensivApiRequest.call(this, 'POST', '/inventory/transfer', {
      productId,
      sourceWarehouseId: warehouseId,
      destinationWarehouseId,
      quantity,
    });
  }

  return responseData;
}

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
import { cleanObject, parseAddress } from '../../utils';

export const warehouseOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['warehouse'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new warehouse',
        action: 'Create warehouse',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a warehouse',
        action: 'Delete warehouse',
      },
      {
        name: 'Disable',
        value: 'disable',
        description: 'Disable a warehouse',
        action: 'Disable warehouse',
      },
      {
        name: 'Enable',
        value: 'enable',
        description: 'Enable a warehouse',
        action: 'Enable warehouse',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a warehouse by ID',
        action: 'Get warehouse',
      },
      {
        name: 'Get Inventory',
        value: 'getInventory',
        description: 'Get warehouse inventory',
        action: 'Get warehouse inventory',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple warehouses',
        action: 'Get many warehouses',
      },
      {
        name: 'Get Orders',
        value: 'getOrders',
        description: 'Get warehouse orders',
        action: 'Get warehouse orders',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a warehouse',
        action: 'Update warehouse',
      },
    ],
    default: 'getAll',
  },
];

export const warehouseFields: INodeProperties[] = [
  // Get/Update/Delete
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['warehouse'],
        operation: [
          'get',
          'update',
          'delete',
          'enable',
          'disable',
          'getInventory',
          'getOrders',
        ],
      },
    },
    description: 'The ID of the warehouse',
  },
  // Create
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['warehouse'],
        operation: ['create'],
      },
    },
    description: 'Warehouse name',
  },
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    required: true,
    default: 'Internal',
    displayOptions: {
      show: {
        resource: ['warehouse'],
        operation: ['create'],
      },
    },
    options: [
      { name: 'Internal', value: 'Internal' },
      { name: '3PL', value: '3PL' },
      { name: 'FBA (Fulfillment by Amazon)', value: 'FBA' },
      { name: 'Dropship', value: 'Dropship' },
    ],
    description: 'Warehouse type',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['warehouse'],
        operation: ['getAll', 'getInventory', 'getOrders'],
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
        resource: ['warehouse'],
        operation: ['getAll', 'getInventory', 'getOrders'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    description: 'Max number of results to return',
  },
  // Address
  {
    displayName: 'Address',
    name: 'address',
    type: 'collection',
    placeholder: 'Add Address Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['warehouse'],
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
        resource: ['warehouse'],
        operation: ['create', 'update', 'getAll'],
      },
    },
    options: [
      {
        displayName: 'Code',
        name: 'code',
        type: 'string',
        default: '',
        description: 'Warehouse code',
      },
      {
        displayName: 'Cutoff Time',
        name: 'cutoffTime',
        type: 'string',
        default: '',
        description: 'Daily cutoff time (e.g., 17:00)',
      },
      {
        displayName: 'Is Active',
        name: 'isActive',
        type: 'boolean',
        default: true,
        description: 'Whether the warehouse is active',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Warehouse name (for updates)',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string',
        default: '',
        description: 'Warehouse timezone',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Internal', value: 'Internal' },
          { name: '3PL', value: '3PL' },
          { name: 'FBA', value: 'FBA' },
          { name: 'Dropship', value: 'Dropship' },
        ],
        default: 'Internal',
        description: 'Filter by warehouse type',
      },
    ],
  },
];

export async function executeWarehouse(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/warehouses/${warehouseId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/warehouses',
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
        '/warehouses',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const name = this.getNodeParameter('name', i) as string;
    const type = this.getNodeParameter('type', i) as string;
    const address = this.getNodeParameter('address', i) as IDataObject;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      name,
      type,
      ...additionalFields,
    });

    if (Object.keys(address).length > 0) {
      body.address = parseAddress(address);
    }

    responseData = await extensivApiRequest.call(this, 'POST', '/warehouses', body);
  }

  if (operation === 'update') {
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const address = this.getNodeParameter('address', i) as IDataObject;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    if (Object.keys(address).length > 0) {
      body.address = parseAddress(address);
    }

    responseData = await extensivApiRequest.call(this, 'PUT', `/warehouses/${warehouseId}`, body);
  }

  if (operation === 'delete') {
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    responseData = await extensivApiRequest.call(this, 'DELETE', `/warehouses/${warehouseId}`);
  }

  if (operation === 'enable') {
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/warehouses/${warehouseId}/enable`,
    );
  }

  if (operation === 'disable') {
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/warehouses/${warehouseId}/disable`,
    );
  }

  if (operation === 'getInventory') {
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        `/warehouses/${warehouseId}/inventory`,
        'data',
        {},
        {},
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        `/warehouses/${warehouseId}/inventory`,
        {},
        { pageSize: limit },
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'getOrders') {
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        `/warehouses/${warehouseId}/orders`,
        'data',
        {},
        {},
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        `/warehouses/${warehouseId}/orders`,
        {},
        { pageSize: limit },
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  return responseData;
}

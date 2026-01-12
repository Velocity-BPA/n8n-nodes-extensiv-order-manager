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

export const vendorOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['vendor'],
      },
    },
    options: [
      {
        name: 'Add Product',
        value: 'addProduct',
        description: 'Associate a product with a vendor',
        action: 'Add product to vendor',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new vendor',
        action: 'Create vendor',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a vendor',
        action: 'Delete vendor',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a vendor by ID',
        action: 'Get vendor',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple vendors',
        action: 'Get many vendors',
      },
      {
        name: 'Get Products',
        value: 'getProducts',
        description: 'Get vendor products',
        action: 'Get vendor products',
      },
      {
        name: 'Get Purchase Orders',
        value: 'getPurchaseOrders',
        description: 'Get vendor purchase orders',
        action: 'Get vendor purchase orders',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a vendor',
        action: 'Update vendor',
      },
    ],
    default: 'getAll',
  },
];

export const vendorFields: INodeProperties[] = [
  // Get/Update/Delete
  {
    displayName: 'Vendor ID',
    name: 'vendorId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['vendor'],
        operation: [
          'get',
          'update',
          'delete',
          'getProducts',
          'getPurchaseOrders',
          'addProduct',
        ],
      },
    },
    description: 'The ID of the vendor',
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
        resource: ['vendor'],
        operation: ['create'],
      },
    },
    description: 'Vendor name',
  },
  // Add Product
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['vendor'],
        operation: ['addProduct'],
      },
    },
    description: 'The ID of the product to associate',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['vendor'],
        operation: ['getAll', 'getProducts', 'getPurchaseOrders'],
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
        resource: ['vendor'],
        operation: ['getAll', 'getProducts', 'getPurchaseOrders'],
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
        resource: ['vendor'],
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
        resource: ['vendor'],
        operation: ['create', 'update', 'getAll', 'addProduct'],
      },
    },
    options: [
      {
        displayName: 'Code',
        name: 'code',
        type: 'string',
        default: '',
        description: 'Vendor code',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'string',
        default: 'USD',
        description: 'Default currency code',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Contact email address',
      },
      {
        displayName: 'Lead Time',
        name: 'leadTime',
        type: 'number',
        default: 0,
        description: 'Lead time in days',
      },
      {
        displayName: 'Minimum Order Amount',
        name: 'minimumOrderAmount',
        type: 'number',
        default: 0,
        description: 'Minimum order amount',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Vendor name (for updates)',
      },
      {
        displayName: 'Payment Terms',
        name: 'paymentTerms',
        type: 'string',
        default: '',
        description: 'Payment terms (e.g., Net 30)',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Contact phone number',
      },
      {
        displayName: 'Unit Cost',
        name: 'unitCost',
        type: 'number',
        default: 0,
        description: 'Unit cost for the product (addProduct operation)',
      },
      {
        displayName: 'Vendor SKU',
        name: 'vendorSku',
        type: 'string',
        default: '',
        description: 'Vendor-specific SKU (addProduct operation)',
      },
    ],
  },
];

export async function executeVendor(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const vendorId = this.getNodeParameter('vendorId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/vendors/${vendorId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/vendors',
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
        '/vendors',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const name = this.getNodeParameter('name', i) as string;
    const address = this.getNodeParameter('address', i) as IDataObject;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      name,
      ...additionalFields,
    });

    if (Object.keys(address).length > 0) {
      body.address = parseAddress(address);
    }

    responseData = await extensivApiRequest.call(this, 'POST', '/vendors', body);
  }

  if (operation === 'update') {
    const vendorId = this.getNodeParameter('vendorId', i) as number;
    const address = this.getNodeParameter('address', i) as IDataObject;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    if (Object.keys(address).length > 0) {
      body.address = parseAddress(address);
    }

    responseData = await extensivApiRequest.call(this, 'PUT', `/vendors/${vendorId}`, body);
  }

  if (operation === 'delete') {
    const vendorId = this.getNodeParameter('vendorId', i) as number;
    responseData = await extensivApiRequest.call(this, 'DELETE', `/vendors/${vendorId}`);
  }

  if (operation === 'getProducts') {
    const vendorId = this.getNodeParameter('vendorId', i) as number;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        `/vendors/${vendorId}/products`,
        'data',
        {},
        {},
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        `/vendors/${vendorId}/products`,
        {},
        { pageSize: limit },
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'getPurchaseOrders') {
    const vendorId = this.getNodeParameter('vendorId', i) as number;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        `/vendors/${vendorId}/purchaseorders`,
        'data',
        {},
        {},
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        `/vendors/${vendorId}/purchaseorders`,
        {},
        { pageSize: limit },
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'addProduct') {
    const vendorId = this.getNodeParameter('vendorId', i) as number;
    const productId = this.getNodeParameter('productId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      productId,
      vendorSku: additionalFields.vendorSku,
      unitCost: additionalFields.unitCost,
    });

    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/vendors/${vendorId}/products`,
      body,
    );
  }

  return responseData;
}

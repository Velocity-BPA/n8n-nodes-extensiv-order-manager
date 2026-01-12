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

export const productOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['product'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new product',
        action: 'Create product',
      },
      {
        name: 'Create Bundle',
        value: 'createBundle',
        description: 'Create a product bundle',
        action: 'Create product bundle',
      },
      {
        name: 'Create Variant',
        value: 'createVariant',
        description: 'Create a product variant',
        action: 'Create product variant',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a product',
        action: 'Delete product',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a product by ID',
        action: 'Get product',
      },
      {
        name: 'Get Bundles',
        value: 'getBundles',
        description: 'Get bundle components',
        action: 'Get product bundles',
      },
      {
        name: 'Get Inventory',
        value: 'getInventory',
        description: 'Get inventory for product',
        action: 'Get product inventory',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple products',
        action: 'Get many products',
      },
      {
        name: 'Get Variants',
        value: 'getVariants',
        description: 'Get product variants',
        action: 'Get product variants',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a product',
        action: 'Update product',
      },
      {
        name: 'Update Inventory',
        value: 'updateInventory',
        description: 'Update inventory levels',
        action: 'Update product inventory',
      },
      {
        name: 'Update Variant',
        value: 'updateVariant',
        description: 'Update a product variant',
        action: 'Update product variant',
      },
    ],
    default: 'getAll',
  },
];

export const productFields: INodeProperties[] = [
  // Get/Update/Delete
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['product'],
        operation: [
          'get',
          'update',
          'delete',
          'getVariants',
          'createVariant',
          'getInventory',
          'updateInventory',
          'getBundles',
          'createBundle',
        ],
      },
    },
    description: 'The ID of the product',
  },
  // Variant ID for update variant
  {
    displayName: 'Variant ID',
    name: 'variantId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['updateVariant'],
      },
    },
    description: 'The ID of the variant',
  },
  // Create operation
  {
    displayName: 'Master SKU',
    name: 'masterSku',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['create'],
      },
    },
    description: 'Master SKU identifier',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['create'],
      },
    },
    description: 'Product name',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['product'],
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
        resource: ['product'],
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
  // Update Inventory
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['updateInventory'],
      },
    },
    description: 'The warehouse ID',
  },
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['updateInventory'],
      },
    },
    description: 'The new inventory quantity',
  },
  // Bundle components
  {
    displayName: 'Bundle Components',
    name: 'bundleComponents',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Component',
    default: {},
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['createBundle'],
      },
    },
    options: [
      {
        displayName: 'Component',
        name: 'component',
        values: [
          {
            displayName: 'Component Product ID',
            name: 'componentProductId',
            type: 'number',
            default: 0,
          },
          {
            displayName: 'Quantity',
            name: 'quantity',
            type: 'number',
            default: 1,
          },
        ],
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
        resource: ['product'],
        operation: ['create', 'update', 'getAll', 'createVariant', 'updateVariant'],
      },
    },
    options: [
      {
        displayName: 'ASIN',
        name: 'asin',
        type: 'string',
        default: '',
        description: 'Amazon Standard Identification Number',
      },
      {
        displayName: 'Brand',
        name: 'brand',
        type: 'string',
        default: '',
        description: 'Product brand',
      },
      {
        displayName: 'Category',
        name: 'category',
        type: 'string',
        default: '',
        description: 'Product category',
      },
      {
        displayName: 'Cost',
        name: 'cost',
        type: 'number',
        default: 0,
        description: 'Product cost',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Product description',
      },
      {
        displayName: 'Is Active',
        name: 'isActive',
        type: 'boolean',
        default: true,
        description: 'Whether the product is active',
      },
      {
        displayName: 'Modified After',
        name: 'modifiedAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter products modified after this date',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Product name (for updates)',
      },
      {
        displayName: 'Price',
        name: 'price',
        type: 'number',
        default: 0,
        description: 'Selling price',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'Product SKU',
      },
      {
        displayName: 'UPC',
        name: 'upc',
        type: 'string',
        default: '',
        description: 'Universal Product Code',
      },
      {
        displayName: 'Weight',
        name: 'weight',
        type: 'number',
        default: 0,
        description: 'Product weight',
      },
      {
        displayName: 'Weight Unit',
        name: 'weightUnit',
        type: 'options',
        options: [
          { name: 'Pounds (lb)', value: 'lb' },
          { name: 'Ounces (oz)', value: 'oz' },
          { name: 'Kilograms (kg)', value: 'kg' },
          { name: 'Grams (g)', value: 'g' },
        ],
        default: 'lb',
        description: 'Weight unit',
      },
    ],
  },
];

export async function executeProduct(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const productId = this.getNodeParameter('productId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/products/${productId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/products',
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
        '/products',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const masterSku = this.getNodeParameter('masterSku', i) as string;
    const name = this.getNodeParameter('name', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      masterSku,
      name,
      ...additionalFields,
    });

    responseData = await extensivApiRequest.call(this, 'POST', '/products', body);
  }

  if (operation === 'update') {
    const productId = this.getNodeParameter('productId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    responseData = await extensivApiRequest.call(this, 'PUT', `/products/${productId}`, body);
  }

  if (operation === 'delete') {
    const productId = this.getNodeParameter('productId', i) as number;
    responseData = await extensivApiRequest.call(this, 'DELETE', `/products/${productId}`);
  }

  if (operation === 'getVariants') {
    const productId = this.getNodeParameter('productId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/products/${productId}/variants`);
  }

  if (operation === 'createVariant') {
    const productId = this.getNodeParameter('productId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/products/${productId}/variants`,
      body,
    );
  }

  if (operation === 'updateVariant') {
    const variantId = this.getNodeParameter('variantId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    responseData = await extensivApiRequest.call(this, 'PUT', `/variants/${variantId}`, body);
  }

  if (operation === 'getInventory') {
    const productId = this.getNodeParameter('productId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/products/${productId}/inventory`);
  }

  if (operation === 'updateInventory') {
    const productId = this.getNodeParameter('productId', i) as number;
    const warehouseId = this.getNodeParameter('warehouseId', i) as number;
    const quantity = this.getNodeParameter('quantity', i) as number;

    responseData = await extensivApiRequest.call(
      this,
      'PUT',
      `/products/${productId}/inventory`,
      {
        warehouseId,
        quantity,
      },
    );
  }

  if (operation === 'getBundles') {
    const productId = this.getNodeParameter('productId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/products/${productId}/bundles`);
  }

  if (operation === 'createBundle') {
    const productId = this.getNodeParameter('productId', i) as number;
    const bundleComponentsData = this.getNodeParameter('bundleComponents', i) as IDataObject;

    const components = (bundleComponentsData.component as IDataObject[]) || [];

    responseData = await extensivApiRequest.call(this, 'POST', `/products/${productId}/bundles`, {
      components,
    });
  }

  return responseData;
}

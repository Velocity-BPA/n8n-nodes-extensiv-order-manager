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

export const customerOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['customer'],
      },
    },
    options: [
      {
        name: 'Add Address',
        value: 'addAddress',
        description: 'Add address to customer',
        action: 'Add customer address',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new customer',
        action: 'Create customer',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a customer',
        action: 'Delete customer',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a customer by ID',
        action: 'Get customer',
      },
      {
        name: 'Get Addresses',
        value: 'getAddresses',
        description: 'Get customer addresses',
        action: 'Get customer addresses',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple customers',
        action: 'Get many customers',
      },
      {
        name: 'Get Orders',
        value: 'getOrders',
        description: "Get customer's orders",
        action: 'Get customer orders',
      },
      {
        name: 'Merge',
        value: 'merge',
        description: 'Merge duplicate customers',
        action: 'Merge customers',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a customer',
        action: 'Update customer',
      },
    ],
    default: 'getAll',
  },
];

export const customerFields: INodeProperties[] = [
  // Get/Update/Delete
  {
    displayName: 'Customer ID',
    name: 'customerId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['get', 'update', 'delete', 'getOrders', 'getAddresses', 'addAddress'],
      },
    },
    description: 'The ID of the customer',
  },
  // Create
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    placeholder: 'name@email.com',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create'],
      },
    },
    description: 'Customer email address',
  },
  // Merge
  {
    displayName: 'Primary Customer ID',
    name: 'primaryCustomerId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['merge'],
      },
    },
    description: 'The ID of the primary customer to keep',
  },
  {
    displayName: 'Duplicate Customer IDs',
    name: 'duplicateCustomerIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['merge'],
      },
    },
    description: 'Comma-separated list of duplicate customer IDs to merge',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['getAll', 'getOrders'],
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
        resource: ['customer'],
        operation: ['getAll', 'getOrders'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    description: 'Max number of results to return',
  },
  // Address for addAddress
  {
    displayName: 'Address',
    name: 'address',
    type: 'collection',
    placeholder: 'Add Address Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['addAddress'],
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
  // Additional Fields
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create', 'update', 'getAll'],
      },
    },
    options: [
      {
        displayName: 'Company',
        name: 'company',
        type: 'string',
        default: '',
        description: 'Company name',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Email address (for filters/updates)',
      },
      {
        displayName: 'First Name',
        name: 'firstName',
        type: 'string',
        default: '',
        description: 'First name',
      },
      {
        displayName: 'Last Name',
        name: 'lastName',
        type: 'string',
        default: '',
        description: 'Last name',
      },
      {
        displayName: 'Modified After',
        name: 'modifiedAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter customers modified after this date',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Phone number',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
    ],
  },
];

export async function executeCustomer(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const customerId = this.getNodeParameter('customerId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/customers/${customerId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/customers',
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
        '/customers',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const email = this.getNodeParameter('email', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      email,
      ...additionalFields,
    });

    if (additionalFields.tags) {
      body.tags = (additionalFields.tags as string).split(',').map((t) => t.trim());
    }

    responseData = await extensivApiRequest.call(this, 'POST', '/customers', body);
  }

  if (operation === 'update') {
    const customerId = this.getNodeParameter('customerId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    if (additionalFields.tags) {
      body.tags = (additionalFields.tags as string).split(',').map((t) => t.trim());
    }

    responseData = await extensivApiRequest.call(this, 'PUT', `/customers/${customerId}`, body);
  }

  if (operation === 'delete') {
    const customerId = this.getNodeParameter('customerId', i) as number;
    responseData = await extensivApiRequest.call(this, 'DELETE', `/customers/${customerId}`);
  }

  if (operation === 'getOrders') {
    const customerId = this.getNodeParameter('customerId', i) as number;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        `/customers/${customerId}/orders`,
        'data',
        {},
        {},
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        `/customers/${customerId}/orders`,
        {},
        { pageSize: limit },
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'getAddresses') {
    const customerId = this.getNodeParameter('customerId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/customers/${customerId}/addresses`);
  }

  if (operation === 'addAddress') {
    const customerId = this.getNodeParameter('customerId', i) as number;
    const address = this.getNodeParameter('address', i) as IDataObject;

    const body = parseAddress(address);

    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/customers/${customerId}/addresses`,
      body,
    );
  }

  if (operation === 'merge') {
    const primaryCustomerId = this.getNodeParameter('primaryCustomerId', i) as number;
    const duplicateCustomerIds = this.getNodeParameter('duplicateCustomerIds', i) as string;

    responseData = await extensivApiRequest.call(this, 'POST', '/customers/merge', {
      primaryCustomerId,
      duplicateCustomerIds: duplicateCustomerIds.split(',').map((id) => parseInt(id.trim(), 10)),
    });
  }

  return responseData;
}

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

export const shipmentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['shipment'],
      },
    },
    options: [
      {
        name: 'Add Package',
        value: 'addPackage',
        description: 'Add package to shipment',
        action: 'Add package to shipment',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a shipment',
        action: 'Cancel shipment',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a shipment',
        action: 'Create shipment',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a shipment by ID',
        action: 'Get shipment',
      },
      {
        name: 'Get Label',
        value: 'getLabel',
        description: 'Get shipping label',
        action: 'Get shipping label',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple shipments',
        action: 'Get many shipments',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update shipment details',
        action: 'Update shipment',
      },
      {
        name: 'Update Tracking',
        value: 'updateTracking',
        description: 'Update tracking info',
        action: 'Update shipment tracking',
      },
      {
        name: 'Void Label',
        value: 'voidLabel',
        description: 'Void shipping label',
        action: 'Void shipping label',
      },
    ],
    default: 'getAll',
  },
];

export const shipmentFields: INodeProperties[] = [
  // Get/Update/Cancel
  {
    displayName: 'Shipment ID',
    name: 'shipmentId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['shipment'],
        operation: [
          'get',
          'update',
          'cancel',
          'addPackage',
          'updateTracking',
          'getLabel',
          'voidLabel',
        ],
      },
    },
    description: 'The ID of the shipment',
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
        resource: ['shipment'],
        operation: ['create'],
      },
    },
    description: 'The associated order ID',
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
        resource: ['shipment'],
        operation: ['updateTracking', 'create'],
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
        resource: ['shipment'],
        operation: ['updateTracking', 'create'],
      },
    },
    description: 'The shipping carrier',
  },
  // Add Package
  {
    displayName: 'Package Weight',
    name: 'packageWeight',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['shipment'],
        operation: ['addPackage'],
      },
    },
    description: 'Weight of the package',
  },
  // GetAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['shipment'],
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
        resource: ['shipment'],
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
        resource: ['shipment'],
        operation: ['create', 'update', 'getAll', 'addPackage'],
      },
    },
    options: [
      {
        displayName: 'Cost',
        name: 'cost',
        type: 'number',
        default: 0,
        description: 'Shipping cost',
      },
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
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: 0,
        description: 'Package height',
      },
      {
        displayName: 'Length',
        name: 'length',
        type: 'number',
        default: 0,
        description: 'Package length',
      },
      {
        displayName: 'Modified After',
        name: 'modifiedAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter shipments modified after this date',
      },
      {
        displayName: 'Order ID',
        name: 'orderId',
        type: 'number',
        default: 0,
        description: 'Filter by order ID',
      },
      {
        displayName: 'Package Tracking Number',
        name: 'packageTrackingNumber',
        type: 'string',
        default: '',
        description: 'Tracking number for the package',
      },
      {
        displayName: 'Service',
        name: 'service',
        type: 'string',
        default: '',
        description: 'Shipping service level',
      },
      {
        displayName: 'Shipped Date',
        name: 'shippedDate',
        type: 'dateTime',
        default: '',
        description: 'Ship date',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Created', value: 'Created' },
          { name: 'In Transit', value: 'InTransit' },
          { name: 'Delivered', value: 'Delivered' },
          { name: 'Exception', value: 'Exception' },
        ],
        default: 'Created',
        description: 'Shipment status',
      },
      {
        displayName: 'Weight',
        name: 'weight',
        type: 'number',
        default: 0,
        description: 'Shipment weight',
      },
      {
        displayName: 'Width',
        name: 'width',
        type: 'number',
        default: 0,
        description: 'Package width',
      },
    ],
  },
];

export async function executeShipment(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  if (operation === 'get') {
    const shipmentId = this.getNodeParameter('shipmentId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/shipments/${shipmentId}`);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    const query = buildQueryFromAdditionalFields(additionalFields);

    if (returnAll) {
      responseData = await extensivApiRequestAllItems.call(
        this,
        'GET',
        '/shipments',
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
        '/shipments',
        {},
        query,
      )) as IDataObject;
      responseData = (response.data || response) as IDataObject[];
    }
  }

  if (operation === 'create') {
    const orderId = this.getNodeParameter('orderId', i) as number;
    const trackingNumber = this.getNodeParameter('trackingNumber', i) as string;
    const carrier = this.getNodeParameter('carrier', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      orderId,
      trackingNumber,
      carrier,
      ...additionalFields,
    });

    responseData = await extensivApiRequest.call(this, 'POST', '/shipments', body);
  }

  if (operation === 'update') {
    const shipmentId = this.getNodeParameter('shipmentId', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({ ...additionalFields });

    responseData = await extensivApiRequest.call(this, 'PUT', `/shipments/${shipmentId}`, body);
  }

  if (operation === 'cancel') {
    const shipmentId = this.getNodeParameter('shipmentId', i) as number;
    responseData = await extensivApiRequest.call(this, 'POST', `/shipments/${shipmentId}/cancel`);
  }

  if (operation === 'addPackage') {
    const shipmentId = this.getNodeParameter('shipmentId', i) as number;
    const packageWeight = this.getNodeParameter('packageWeight', i) as number;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

    const body: IDataObject = cleanObject({
      weight: packageWeight,
      ...additionalFields,
    });

    if (additionalFields.length || additionalFields.width || additionalFields.height) {
      body.dimensions = cleanObject({
        length: additionalFields.length,
        width: additionalFields.width,
        height: additionalFields.height,
      });
      delete body.length;
      delete body.width;
      delete body.height;
    }

    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/shipments/${shipmentId}/packages`,
      body,
    );
  }

  if (operation === 'updateTracking') {
    const shipmentId = this.getNodeParameter('shipmentId', i) as number;
    const trackingNumber = this.getNodeParameter('trackingNumber', i) as string;
    const carrier = this.getNodeParameter('carrier', i) as string;

    responseData = await extensivApiRequest.call(this, 'PUT', `/shipments/${shipmentId}/tracking`, {
      trackingNumber,
      carrier,
    });
  }

  if (operation === 'getLabel') {
    const shipmentId = this.getNodeParameter('shipmentId', i) as number;
    responseData = await extensivApiRequest.call(this, 'GET', `/shipments/${shipmentId}/label`);
  }

  if (operation === 'voidLabel') {
    const shipmentId = this.getNodeParameter('shipmentId', i) as number;
    responseData = await extensivApiRequest.call(
      this,
      'POST',
      `/shipments/${shipmentId}/label/void`,
    );
  }

  return responseData;
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { extensivApiRequest } from '../../transport';
import { cleanObject } from '../../utils';

export const analyticsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['analytics'],
      },
    },
    options: [
      {
        name: 'Get Channel Performance',
        value: 'getChannelPerformance',
        description: 'Get channel performance metrics',
        action: 'Get channel performance',
      },
      {
        name: 'Get Custom Report',
        value: 'getCustomReport',
        description: 'Run a custom report',
        action: 'Get custom report',
      },
      {
        name: 'Get Inventory Report',
        value: 'getInventoryReport',
        description: 'Get inventory analytics',
        action: 'Get inventory report',
      },
      {
        name: 'Get Order Report',
        value: 'getOrderReport',
        description: 'Get order metrics',
        action: 'Get order report',
      },
      {
        name: 'Get Product Performance',
        value: 'getProductPerformance',
        description: 'Get product performance metrics',
        action: 'Get product performance',
      },
      {
        name: 'Get Sales Report',
        value: 'getSalesReport',
        description: 'Get sales analytics',
        action: 'Get sales report',
      },
    ],
    default: 'getSalesReport',
  },
];

export const analyticsFields: INodeProperties[] = [
  // Date Range (required for all reports)
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['analytics'],
      },
    },
    description: 'Report start date',
  },
  {
    displayName: 'End Date',
    name: 'endDate',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['analytics'],
      },
    },
    description: 'Report end date',
  },
  // Group By
  {
    displayName: 'Group By',
    name: 'groupBy',
    type: 'options',
    default: 'Day',
    displayOptions: {
      show: {
        resource: ['analytics'],
      },
    },
    options: [
      { name: 'Day', value: 'Day' },
      { name: 'Week', value: 'Week' },
      { name: 'Month', value: 'Month' },
      { name: 'Quarter', value: 'Quarter' },
      { name: 'Year', value: 'Year' },
    ],
    description: 'Time period grouping',
  },
  // Custom Report Type
  {
    displayName: 'Report Type',
    name: 'reportType',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['analytics'],
        operation: ['getCustomReport'],
      },
    },
    description: 'Custom report type identifier',
  },
  // Metrics Selection (Custom Report)
  {
    displayName: 'Metrics',
    name: 'metrics',
    type: 'multiOptions',
    default: [],
    displayOptions: {
      show: {
        resource: ['analytics'],
        operation: ['getCustomReport'],
      },
    },
    options: [
      { name: 'Average Order Value', value: 'averageOrderValue' },
      { name: 'Gross Revenue', value: 'grossRevenue' },
      { name: 'Net Revenue', value: 'netRevenue' },
      { name: 'Order Count', value: 'orderCount' },
      { name: 'Refund Amount', value: 'refundAmount' },
      { name: 'Return Rate', value: 'returnRate' },
      { name: 'Shipping Cost', value: 'shippingCost' },
      { name: 'Units Sold', value: 'unitsSold' },
    ],
    description: 'Metrics to include in the report',
  },
  // Filter Options
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['analytics'],
      },
    },
    options: [
      {
        displayName: 'Channel IDs',
        name: 'channelIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of channel IDs to filter by',
      },
      {
        displayName: 'Product IDs',
        name: 'productIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of product IDs to filter by',
      },
      {
        displayName: 'Warehouse IDs',
        name: 'warehouseIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of warehouse IDs to filter by',
      },
    ],
  },
  // Additional Options
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['analytics'],
      },
    },
    options: [
      {
        displayName: 'Compare to Previous Period',
        name: 'compareToPrevious',
        type: 'boolean',
        default: false,
        description: 'Whether to include comparison to previous period',
      },
      {
        displayName: 'Include Breakdown',
        name: 'includeBreakdown',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed breakdown',
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          { name: 'JSON', value: 'json' },
          { name: 'Summary', value: 'summary' },
        ],
        default: 'json',
        description: 'Output format for the report',
      },
    ],
  },
];

export async function executeAnalytics(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  const startDate = this.getNodeParameter('startDate', i) as string;
  const endDate = this.getNodeParameter('endDate', i) as string;
  const groupBy = this.getNodeParameter('groupBy', i) as string;
  const filters = this.getNodeParameter('filters', i) as IDataObject;
  const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

  // Build base query params
  const baseParams: IDataObject = cleanObject({
    startDate,
    endDate,
    groupBy,
    ...additionalOptions,
  });

  // Add filter arrays
  if (filters.channelIds) {
    baseParams.channels = (filters.channelIds as string).split(',').map((id) => id.trim());
  }
  if (filters.warehouseIds) {
    baseParams.warehouses = (filters.warehouseIds as string).split(',').map((id) => id.trim());
  }
  if (filters.productIds) {
    baseParams.products = (filters.productIds as string).split(',').map((id) => id.trim());
  }

  if (operation === 'getSalesReport') {
    responseData = await extensivApiRequest.call(
      this,
      'GET',
      '/analytics/sales',
      {},
      baseParams,
    );
  }

  if (operation === 'getInventoryReport') {
    responseData = await extensivApiRequest.call(
      this,
      'GET',
      '/analytics/inventory',
      {},
      baseParams,
    );
  }

  if (operation === 'getOrderReport') {
    responseData = await extensivApiRequest.call(
      this,
      'GET',
      '/analytics/orders',
      {},
      baseParams,
    );
  }

  if (operation === 'getChannelPerformance') {
    responseData = await extensivApiRequest.call(
      this,
      'GET',
      '/analytics/channels',
      {},
      baseParams,
    );
  }

  if (operation === 'getProductPerformance') {
    responseData = await extensivApiRequest.call(
      this,
      'GET',
      '/analytics/products',
      {},
      baseParams,
    );
  }

  if (operation === 'getCustomReport') {
    const reportType = this.getNodeParameter('reportType', i) as string;
    const metrics = this.getNodeParameter('metrics', i) as string[];

    const customParams: IDataObject = {
      ...baseParams,
      reportType,
    };

    if (metrics && metrics.length > 0) {
      customParams.metrics = metrics;
    }

    responseData = await extensivApiRequest.call(
      this,
      'POST',
      '/analytics/custom',
      customParams,
    );
  }

  return responseData;
}

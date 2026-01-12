/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IDataObject,
  IHookFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IPollFunctions,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';

import { extensivApiRequest } from './transport';

// Licensing notice - logged once per node load
let licensingNoticeLogged = false;

function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
    licensingNoticeLogged = true;
  }
}

export class ExtensivOrderManagerTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Extensiv Order Manager Trigger',
    name: 'extensivOrderManagerTrigger',
    icon: 'file:extensiv.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts the workflow when Extensiv Order Manager events occur',
    defaults: {
      name: 'Extensiv Order Manager Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'extensivOrderManagerOAuth2Api',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Trigger Mode',
        name: 'triggerMode',
        type: 'options',
        options: [
          {
            name: 'Webhook',
            value: 'webhook',
            description: 'Listen for real-time webhook events',
          },
          {
            name: 'Polling',
            value: 'polling',
            description: 'Poll for changes at regular intervals',
          },
        ],
        default: 'polling',
        description: 'How to receive events from Extensiv Order Manager',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            triggerMode: ['webhook'],
          },
        },
        options: [
          {
            name: 'Inventory Updated',
            value: 'inventory.updated',
          },
          {
            name: 'Order Cancelled',
            value: 'order.cancelled',
          },
          {
            name: 'Order Created',
            value: 'order.created',
          },
          {
            name: 'Order Shipped',
            value: 'order.shipped',
          },
          {
            name: 'Order Updated',
            value: 'order.updated',
          },
          {
            name: 'Product Created',
            value: 'product.created',
          },
          {
            name: 'Product Updated',
            value: 'product.updated',
          },
          {
            name: 'Purchase Order Received',
            value: 'purchaseOrder.received',
          },
          {
            name: 'Return Created',
            value: 'return.created',
          },
          {
            name: 'Return Processed',
            value: 'return.processed',
          },
          {
            name: 'Shipment Created',
            value: 'shipment.created',
          },
          {
            name: 'Shipment Delivered',
            value: 'shipment.delivered',
          },
        ],
        default: 'order.created',
        description: 'The webhook event to listen for',
      },
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        displayOptions: {
          show: {
            triggerMode: ['polling'],
          },
        },
        options: [
          {
            name: 'Customer',
            value: 'customer',
          },
          {
            name: 'Inventory',
            value: 'inventory',
          },
          {
            name: 'Order',
            value: 'order',
          },
          {
            name: 'Product',
            value: 'product',
          },
          {
            name: 'Purchase Order',
            value: 'purchaseOrder',
          },
          {
            name: 'Return',
            value: 'return',
          },
          {
            name: 'Shipment',
            value: 'shipment',
          },
        ],
        default: 'order',
        description: 'Resource to poll for changes',
      },
      {
        displayName: 'Poll Times',
        name: 'pollTimes',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            triggerMode: ['polling'],
          },
        },
        default: {},
        description: 'Time at which polling should happen',
        options: [
          {
            name: 'item',
            displayName: 'Item',
            values: [
              {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                  {
                    name: 'Every Minute',
                    value: 'everyMinute',
                  },
                  {
                    name: 'Every 5 Minutes',
                    value: 'everyFiveMinutes',
                  },
                  {
                    name: 'Every 10 Minutes',
                    value: 'everyTenMinutes',
                  },
                  {
                    name: 'Every 15 Minutes',
                    value: 'everyFifteenMinutes',
                  },
                  {
                    name: 'Every 30 Minutes',
                    value: 'everyThirtyMinutes',
                  },
                  {
                    name: 'Every Hour',
                    value: 'everyHour',
                  },
                ],
                default: 'everyFiveMinutes',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Additional Filters',
        name: 'additionalFilters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            triggerMode: ['polling'],
          },
        },
        options: [
          {
            displayName: 'Channel ID',
            name: 'channelId',
            type: 'number',
            default: 0,
            description: 'Filter by channel ID',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'string',
            default: '',
            description: 'Filter by status',
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
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default');
        const event = this.getNodeParameter('event') as string;

        try {
          const response = (await extensivApiRequest.call(
            this,
            'GET',
            '/webhooks',
          )) as IDataObject;

          const webhooks = (response.data || response) as IDataObject[];

          for (const webhook of webhooks) {
            if (webhook.url === webhookUrl && webhook.event === event) {
              webhookData.webhookId = webhook.webhookId;
              return true;
            }
          }
        } catch {
          return false;
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default');
        const event = this.getNodeParameter('event') as string;

        const body = {
          url: webhookUrl,
          event,
          isActive: true,
        };

        try {
          const response = (await extensivApiRequest.call(
            this,
            'POST',
            '/webhooks',
            body,
          )) as IDataObject;

          webhookData.webhookId = response.webhookId || response.id;
          return true;
        } catch {
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookId = webhookData.webhookId as string;

        if (!webhookId) {
          return true;
        }

        try {
          await extensivApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
          delete webhookData.webhookId;
          return true;
        } catch {
          return false;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    logLicensingNotice();

    const req = this.getRequestObject();
    const body = req.body as IDataObject;

    return {
      workflowData: [this.helpers.returnJsonArray(body)],
    };
  }

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    logLicensingNotice();

    const pollData = this.getWorkflowStaticData('node');
    const resource = this.getNodeParameter('resource') as string;
    const additionalFilters = this.getNodeParameter('additionalFilters') as IDataObject;

    // Get the last poll time or default to 1 hour ago
    const lastPollTime = (pollData.lastPollTime as string) || new Date(Date.now() - 3600000).toISOString();
    const now = new Date().toISOString();

    // Build the endpoint based on resource
    let endpoint: string;
    switch (resource) {
      case 'order':
        endpoint = '/orders';
        break;
      case 'product':
        endpoint = '/products';
        break;
      case 'inventory':
        endpoint = '/inventory';
        break;
      case 'purchaseOrder':
        endpoint = '/purchaseorders';
        break;
      case 'shipment':
        endpoint = '/shipments';
        break;
      case 'customer':
        endpoint = '/customers';
        break;
      case 'return':
        endpoint = '/returns';
        break;
      default:
        endpoint = '/orders';
    }

    // Build query parameters
    const query: IDataObject = {
      modifiedAfter: lastPollTime,
      pageSize: 100,
    };

    // Add additional filters
    if (additionalFilters.channelId && additionalFilters.channelId !== 0) {
      query.channelId = additionalFilters.channelId;
    }
    if (additionalFilters.warehouseId && additionalFilters.warehouseId !== 0) {
      query.warehouseId = additionalFilters.warehouseId;
    }
    if (additionalFilters.status) {
      query.status = additionalFilters.status;
    }

    try {
      const response = (await extensivApiRequest.call(
        this,
        'GET',
        endpoint,
        {},
        query,
      )) as IDataObject;

      // Update the last poll time
      pollData.lastPollTime = now;

      const items = (response.data || response) as IDataObject[];

      if (Array.isArray(items) && items.length > 0) {
        return [this.helpers.returnJsonArray(items)];
      }

      return null;
    } catch {
      // Update poll time even on error to prevent repeated failures
      pollData.lastPollTime = now;
      return null;
    }
  }
}

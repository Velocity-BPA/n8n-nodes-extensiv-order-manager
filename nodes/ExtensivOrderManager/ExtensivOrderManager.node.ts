/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

// Import resource operations and fields
import { orderOperations, orderFields, executeOrder } from './actions/order';
import { productOperations, productFields, executeProduct } from './actions/product';
import { inventoryOperations, inventoryFields, executeInventory } from './actions/inventory';
import {
  purchaseOrderOperations,
  purchaseOrderFields,
  executePurchaseOrder,
} from './actions/purchaseOrder';
import { shipmentOperations, shipmentFields, executeShipment } from './actions/shipment';
import { customerOperations, customerFields, executeCustomer } from './actions/customer';
import { warehouseOperations, warehouseFields, executeWarehouse } from './actions/warehouse';
import { channelOperations, channelFields, executeChannel } from './actions/channel';
import { vendorOperations, vendorFields, executeVendor } from './actions/vendor';
import { listingOperations, listingFields, executeListing } from './actions/listing';
import { returnOperations, returnFields, executeReturn } from './actions/return';
import { analyticsOperations, analyticsFields, executeAnalytics } from './actions/analytics';

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

export class ExtensivOrderManager implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Extensiv Order Manager',
    name: 'extensivOrderManager',
    icon: 'file:extensiv.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Interact with Extensiv Order Manager API for e-commerce order and inventory management',
    defaults: {
      name: 'Extensiv Order Manager',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'extensivOrderManagerOAuth2Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Analytics',
            value: 'analytics',
          },
          {
            name: 'Channel',
            value: 'channel',
          },
          {
            name: 'Customer',
            value: 'customer',
          },
          {
            name: 'Inventory',
            value: 'inventory',
          },
          {
            name: 'Listing',
            value: 'listing',
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
          {
            name: 'Vendor',
            value: 'vendor',
          },
          {
            name: 'Warehouse',
            value: 'warehouse',
          },
        ],
        default: 'order',
      },
      // Order
      ...orderOperations,
      ...orderFields,
      // Product
      ...productOperations,
      ...productFields,
      // Inventory
      ...inventoryOperations,
      ...inventoryFields,
      // Purchase Order
      ...purchaseOrderOperations,
      ...purchaseOrderFields,
      // Shipment
      ...shipmentOperations,
      ...shipmentFields,
      // Customer
      ...customerOperations,
      ...customerFields,
      // Warehouse
      ...warehouseOperations,
      ...warehouseFields,
      // Channel
      ...channelOperations,
      ...channelFields,
      // Vendor
      ...vendorOperations,
      ...vendorFields,
      // Listing
      ...listingOperations,
      ...listingFields,
      // Return
      ...returnOperations,
      ...returnFields,
      // Analytics
      ...analyticsOperations,
      ...analyticsFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once per node load
    logLicensingNotice();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        switch (resource) {
          case 'order':
            responseData = await executeOrder.call(this, operation, i);
            break;
          case 'product':
            responseData = await executeProduct.call(this, operation, i);
            break;
          case 'inventory':
            responseData = await executeInventory.call(this, operation, i);
            break;
          case 'purchaseOrder':
            responseData = await executePurchaseOrder.call(this, operation, i);
            break;
          case 'shipment':
            responseData = await executeShipment.call(this, operation, i);
            break;
          case 'customer':
            responseData = await executeCustomer.call(this, operation, i);
            break;
          case 'warehouse':
            responseData = await executeWarehouse.call(this, operation, i);
            break;
          case 'channel':
            responseData = await executeChannel.call(this, operation, i);
            break;
          case 'vendor':
            responseData = await executeVendor.call(this, operation, i);
            break;
          case 'listing':
            responseData = await executeListing.call(this, operation, i);
            break;
          case 'return':
            responseData = await executeReturn.call(this, operation, i);
            break;
          case 'analytics':
            responseData = await executeAnalytics.call(this, operation, i);
            break;
          default:
            throw new NodeOperationError(
              this.getNode(),
              `The resource "${resource}" is not supported!`,
            );
        }

        // Handle array or single response
        if (Array.isArray(responseData)) {
          returnData.push(
            ...responseData.map((data) => ({
              json: data,
            })),
          );
        } else {
          returnData.push({
            json: responseData,
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

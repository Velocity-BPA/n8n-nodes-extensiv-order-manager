/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodePropertyOptions } from 'n8n-workflow';

/**
 * Convert a string to title case (handles camelCase)
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  // Insert space before capital letters (to handle camelCase/PascalCase)
  const spaced = str.replace(/([A-Z])/g, ' $1').trim();
  // Capitalize first letter of each word
  return spaced.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Clean an object by removing undefined and null values
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const cleaned: IDataObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value as IDataObject);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Parse address from additional fields
 */
export function parseAddress(addressFields: IDataObject): IDataObject {
  return cleanObject({
    street1: addressFields.street1 as string,
    street2: addressFields.street2 as string,
    city: addressFields.city as string,
    state: addressFields.state as string,
    postalCode: addressFields.postalCode as string,
    country: addressFields.country as string,
    phone: addressFields.phone as string,
  });
}

/**
 * Parse line items from additional fields (handles both array and fixedCollection format)
 */
export function parseLineItems(lineItems: IDataObject | IDataObject[]): IDataObject[] {
  // Handle fixedCollection format { itemValues: [...] }
  if (!Array.isArray(lineItems) && typeof lineItems === 'object') {
    const items = lineItems.itemValues;
    if (!Array.isArray(items)) {
      return [];
    }
    return (items as IDataObject[]).map((item) =>
      cleanObject({
        productId: item.productId,
        sku: item.sku as string,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        name: item.name as string,
      }),
    );
  }
  
  // Handle direct array format
  if (!Array.isArray(lineItems)) {
    return [];
  }
  
  return lineItems.map((item) =>
    cleanObject({
      productId: item.productId,
      sku: item.sku as string,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      name: item.name as string,
    }),
  );
}

/**
 * Generate options for order status
 */
export function getOrderStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Awaiting', value: 'Awaiting' },
    { name: 'Processing', value: 'Processing' },
    { name: 'Shipped', value: 'Shipped' },
    { name: 'Delivered', value: 'Delivered' },
    { name: 'Cancelled', value: 'Cancelled' },
  ];
}

/**
 * Generate options for priority
 */
export function getPriorityOptions(): INodePropertyOptions[] {
  return [
    { name: 'Low', value: 'Low' },
    { name: 'Normal', value: 'Normal' },
    { name: 'High', value: 'High' },
    { name: 'Critical', value: 'Critical' },
  ];
}

/**
 * Generate options for fulfillment status
 */
export function getFulfillmentStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Unfulfilled', value: 'Unfulfilled' },
    { name: 'Partially Fulfilled', value: 'PartiallyFulfilled' },
    { name: 'Fulfilled', value: 'Fulfilled' },
  ];
}

/**
 * Generate options for weight unit
 */
export function getWeightUnitOptions(): INodePropertyOptions[] {
  return [
    { name: 'Pounds (lb)', value: 'lb' },
    { name: 'Ounces (oz)', value: 'oz' },
    { name: 'Kilograms (kg)', value: 'kg' },
    { name: 'Grams (g)', value: 'g' },
  ];
}

/**
 * Generate options for purchase order status
 */
export function getPurchaseOrderStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Draft', value: 'Draft' },
    { name: 'Pending', value: 'Pending' },
    { name: 'Approved', value: 'Approved' },
    { name: 'Ordered', value: 'Ordered' },
    { name: 'Receiving', value: 'Receiving' },
    { name: 'Closed', value: 'Closed' },
    { name: 'Cancelled', value: 'Cancelled' },
  ];
}

/**
 * Generate options for shipment status
 */
export function getShipmentStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Created', value: 'Created' },
    { name: 'In Transit', value: 'InTransit' },
    { name: 'Delivered', value: 'Delivered' },
    { name: 'Exception', value: 'Exception' },
  ];
}

/**
 * Generate options for warehouse type
 */
export function getWarehouseTypeOptions(): INodePropertyOptions[] {
  return [
    { name: 'Internal', value: 'Internal' },
    { name: '3PL', value: '3PL' },
    { name: 'FBA (Fulfillment by Amazon)', value: 'FBA' },
    { name: 'Dropship', value: 'Dropship' },
  ];
}

/**
 * Generate options for channel type
 */
export function getChannelTypeOptions(): INodePropertyOptions[] {
  return [
    { name: 'Amazon', value: 'Amazon' },
    { name: 'eBay', value: 'eBay' },
    { name: 'Shopify', value: 'Shopify' },
    { name: 'WooCommerce', value: 'WooCommerce' },
    { name: 'Walmart', value: 'Walmart' },
    { name: 'Manual', value: 'Manual' },
  ];
}

/**
 * Generate options for channel status
 */
export function getChannelStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Active', value: 'Active' },
    { name: 'Inactive', value: 'Inactive' },
    { name: 'Error', value: 'Error' },
  ];
}

/**
 * Generate options for listing status
 */
export function getListingStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Active', value: 'Active' },
    { name: 'Inactive', value: 'Inactive' },
    { name: 'Out of Stock', value: 'OutOfStock' },
    { name: 'Error', value: 'Error' },
  ];
}

/**
 * Generate options for return status
 */
export function getReturnStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Requested', value: 'Requested' },
    { name: 'Approved', value: 'Approved' },
    { name: 'Received', value: 'Received' },
    { name: 'Processed', value: 'Processed' },
    { name: 'Cancelled', value: 'Cancelled' },
  ];
}

/**
 * Generate options for return type
 */
export function getReturnTypeOptions(): INodePropertyOptions[] {
  return [
    { name: 'Refund', value: 'Refund' },
    { name: 'Exchange', value: 'Exchange' },
    { name: 'Store Credit', value: 'StoreCredit' },
  ];
}

/**
 * Generate options for analytics group by
 */
export function getGroupByOptions(): INodePropertyOptions[] {
  return [
    { name: 'Day', value: 'Day' },
    { name: 'Week', value: 'Week' },
    { name: 'Month', value: 'Month' },
    { name: 'Quarter', value: 'Quarter' },
    { name: 'Year', value: 'Year' },
  ];
}

/**
 * Simplify response data for n8n output
 */
export function simplifyResponse(response: IDataObject | IDataObject[]): IDataObject | IDataObject[] {
  if (Array.isArray(response)) {
    return response.map((item) => cleanObject(item));
  }
  return cleanObject(response);
}

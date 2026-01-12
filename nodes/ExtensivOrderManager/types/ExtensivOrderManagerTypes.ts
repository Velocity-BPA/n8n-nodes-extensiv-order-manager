/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// Enums
export type OrderStatus = 'Awaiting' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type Priority = 'Low' | 'Normal' | 'High' | 'Critical';
export type FulfillmentStatus = 'Unfulfilled' | 'PartiallyFulfilled' | 'Fulfilled';
export type WeightUnit = 'lb' | 'oz' | 'kg' | 'g';
export type PurchaseOrderStatus =
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Ordered'
  | 'Receiving'
  | 'Closed'
  | 'Cancelled';
export type ShipmentStatus = 'Created' | 'InTransit' | 'Delivered' | 'Exception';
export type WarehouseType = 'Internal' | '3PL' | 'FBA' | 'Dropship';
export type ChannelType =
  | 'Amazon'
  | 'eBay'
  | 'Shopify'
  | 'WooCommerce'
  | 'Walmart'
  | 'Manual';
export type ChannelStatus = 'Active' | 'Inactive' | 'Error';
export type ListingStatus = 'Active' | 'Inactive' | 'OutOfStock' | 'Error';
export type ReturnStatus = 'Requested' | 'Approved' | 'Received' | 'Processed' | 'Cancelled';
export type ReturnType = 'Refund' | 'Exchange' | 'StoreCredit';
export type GroupBy = 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year';

// Resource Types
export interface ExtensivAddress extends IDataObject {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface ExtensivOrder extends IDataObject {
  orderId: number;
  orderNumber: string;
  channelId?: number;
  status: OrderStatus;
  customerId?: number;
  orderDate?: string;
  shipByDate?: string;
  warehouseId?: number;
  shippingMethod?: string;
  priority?: Priority;
  tags?: string[];
  fulfillmentStatus?: FulfillmentStatus;
  shippingAddress?: ExtensivAddress;
  billingAddress?: ExtensivAddress;
  lineItems?: ExtensivOrderLineItem[];
  notes?: string;
  totalAmount?: number;
  currency?: string;
}

export interface ExtensivOrderLineItem extends IDataObject {
  lineItemId?: number;
  productId?: number;
  sku?: string;
  name?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface ExtensivProduct extends IDataObject {
  productId: number;
  masterSku: string;
  name: string;
  description?: string;
  upc?: string;
  asin?: string;
  weight?: number;
  weightUnit?: WeightUnit;
  cost?: number;
  price?: number;
  category?: string;
  brand?: string;
  isActive?: boolean;
  variants?: ExtensivProductVariant[];
  images?: string[];
}

export interface ExtensivProductVariant extends IDataObject {
  variantId?: number;
  sku?: string;
  name?: string;
  attributes?: IDataObject;
  price?: number;
  cost?: number;
  weight?: number;
}

export interface ExtensivInventory extends IDataObject {
  productId: number;
  warehouseId: number;
  sku?: string;
  availableQuantity: number;
  onHandQuantity: number;
  reservedQuantity?: number;
  inboundQuantity?: number;
  allocatedQuantity?: number;
  minStock?: number;
  maxStock?: number;
}

export interface ExtensivPurchaseOrder extends IDataObject {
  purchaseOrderId: number;
  poNumber: string;
  vendorId: number;
  status: PurchaseOrderStatus;
  warehouseId?: number;
  orderDate?: string;
  expectedDate?: string;
  currency?: string;
  totalCost?: number;
  notes?: string;
  lineItems?: ExtensivPurchaseOrderLineItem[];
}

export interface ExtensivPurchaseOrderLineItem extends IDataObject {
  lineItemId?: number;
  productId?: number;
  sku?: string;
  quantity?: number;
  unitCost?: number;
  totalCost?: number;
  receivedQuantity?: number;
}

export interface ExtensivShipment extends IDataObject {
  shipmentId: number;
  orderId: number;
  trackingNumber?: string;
  carrier?: string;
  service?: string;
  shippedDate?: string;
  deliveredDate?: string;
  status: ShipmentStatus;
  weight?: number;
  cost?: number;
  packages?: ExtensivPackage[];
}

export interface ExtensivPackage extends IDataObject {
  packageId?: number;
  trackingNumber?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
}

export interface ExtensivCustomer extends IDataObject {
  customerId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
  addresses?: ExtensivAddress[];
}

export interface ExtensivWarehouse extends IDataObject {
  warehouseId: number;
  name: string;
  code?: string;
  type: WarehouseType;
  address?: ExtensivAddress;
  isActive?: boolean;
  timezone?: string;
  cutoffTime?: string;
}

export interface ExtensivChannel extends IDataObject {
  channelId: number;
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  lastSync?: string;
  credentials?: IDataObject;
  settings?: IDataObject;
}

export interface ExtensivVendor extends IDataObject {
  vendorId: number;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: ExtensivAddress;
  paymentTerms?: string;
  leadTime?: number;
  currency?: string;
}

export interface ExtensivListing extends IDataObject {
  listingId: number;
  productId: number;
  channelId: number;
  listingSku?: string;
  title?: string;
  price?: number;
  quantity?: number;
  status: ListingStatus;
  url?: string;
}

export interface ExtensivReturn extends IDataObject {
  returnId: number;
  orderId: number;
  rmaNumber?: string;
  status: ReturnStatus;
  reason?: string;
  returnType?: ReturnType;
  items?: ExtensivReturnItem[];
  refundAmount?: number;
}

export interface ExtensivReturnItem extends IDataObject {
  itemId?: number;
  productId?: number;
  sku?: string;
  quantity?: number;
  reason?: string;
}

export interface ExtensivAnalyticsReport extends IDataObject {
  startDate: string;
  endDate: string;
  groupBy?: GroupBy;
  channels?: number[];
  warehouses?: number[];
  metrics?: string[];
  data?: IDataObject[];
}

// API Response Types
export interface ExtensivApiResponse<T> extends IDataObject {
  data: T[];
  pagination?: ExtensivPagination;
}

export interface ExtensivPagination extends IDataObject {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface ExtensivApiError extends IDataObject {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// Webhook Types
export interface ExtensivWebhookPayload extends IDataObject {
  event: string;
  timestamp: string;
  data: IDataObject;
}

export type WebhookEventType =
  | 'order.created'
  | 'order.updated'
  | 'order.shipped'
  | 'order.cancelled'
  | 'inventory.updated'
  | 'shipment.created'
  | 'shipment.delivered'
  | 'product.created'
  | 'product.updated'
  | 'purchaseOrder.received'
  | 'return.created'
  | 'return.processed';

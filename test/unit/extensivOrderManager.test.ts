/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { cleanObject, toTitleCase, parseAddress, parseLineItems } from '../../nodes/ExtensivOrderManager/utils';
import {
  getOrderStatusOptions,
  getPriorityOptions,
  getWeightUnitOptions,
  getWarehouseTypeOptions,
  getChannelTypeOptions,
  getListingStatusOptions,
  getReturnStatusOptions,
  getReturnTypeOptions,
  getGroupByOptions,
} from '../../nodes/ExtensivOrderManager/utils';

describe('ExtensivOrderManager Utils', () => {
  describe('cleanObject', () => {
    it('should remove undefined values', () => {
      const input = { a: 1, b: undefined, c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should remove null values', () => {
      const input = { a: 1, b: null, c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should remove empty strings', () => {
      const input = { a: 1, b: '', c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should keep zero values', () => {
      const input = { a: 0, b: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 0, b: 'test' });
    });

    it('should keep false values', () => {
      const input = { a: false, b: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: false, b: 'test' });
    });

    it('should handle empty object', () => {
      const result = cleanObject({});
      expect(result).toEqual({});
    });
  });

  describe('toTitleCase', () => {
    it('should convert camelCase to Title Case', () => {
      expect(toTitleCase('orderStatus')).toBe('Order Status');
    });

    it('should handle single word', () => {
      expect(toTitleCase('order')).toBe('Order');
    });

    it('should handle already capitalized words', () => {
      expect(toTitleCase('OrderStatus')).toBe('Order Status');
    });

    it('should handle empty string', () => {
      expect(toTitleCase('')).toBe('');
    });
  });

  describe('parseAddress', () => {
    it('should parse a complete address object', () => {
      const input = {
        street1: '123 Main St',
        street2: 'Suite 100',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = parseAddress(input);
      expect(result).toEqual(input);
    });

    it('should handle partial address', () => {
      const input = {
        street1: '123 Main St',
        city: 'New York',
      };
      const result = parseAddress(input);
      expect(result).toEqual({
        street1: '123 Main St',
        city: 'New York',
      });
    });

    it('should handle empty object', () => {
      const result = parseAddress({});
      expect(result).toEqual({});
    });
  });

  describe('parseLineItems', () => {
    it('should parse line items collection', () => {
      const input = {
        itemValues: [
          { productId: 1, quantity: 2, unitPrice: 10.99, sku: 'SKU-001', name: 'Item 1' },
          { productId: 2, quantity: 1, unitPrice: 20.99, sku: 'SKU-002', name: 'Item 2' },
        ],
      };
      const result = parseLineItems(input);
      expect(result).toEqual([
        { productId: 1, quantity: 2, unitPrice: 10.99, sku: 'SKU-001', name: 'Item 1' },
        { productId: 2, quantity: 1, unitPrice: 20.99, sku: 'SKU-002', name: 'Item 2' },
      ]);
    });

    it('should return empty array for missing itemValues', () => {
      const result = parseLineItems({});
      expect(result).toEqual([]);
    });

    it('should return empty array for non-array itemValues', () => {
      const result = parseLineItems({ itemValues: 'not an array' });
      expect(result).toEqual([]);
    });
  });

  describe('Option Generators', () => {
    it('should return order status options', () => {
      const options = getOrderStatusOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      expect(options[0]).toHaveProperty('name');
      expect(options[0]).toHaveProperty('value');
    });

    it('should return priority options', () => {
      const options = getPriorityOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(4);
      expect(options.map(o => o.value)).toContain('Normal');
    });

    it('should return weight unit options', () => {
      const options = getWeightUnitOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.map(o => o.value)).toContain('lb');
      expect(options.map(o => o.value)).toContain('kg');
    });

    it('should return warehouse type options', () => {
      const options = getWarehouseTypeOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.map(o => o.value)).toContain('Internal');
      expect(options.map(o => o.value)).toContain('3PL');
    });

    it('should return channel type options', () => {
      const options = getChannelTypeOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.map(o => o.value)).toContain('Amazon');
      expect(options.map(o => o.value)).toContain('Shopify');
    });

    it('should return listing status options', () => {
      const options = getListingStatusOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.map(o => o.value)).toContain('Active');
    });

    it('should return return status options', () => {
      const options = getReturnStatusOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.map(o => o.value)).toContain('Requested');
      expect(options.map(o => o.value)).toContain('Approved');
    });

    it('should return return type options', () => {
      const options = getReturnTypeOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.map(o => o.value)).toContain('Refund');
      expect(options.map(o => o.value)).toContain('Exchange');
    });

    it('should return group by options', () => {
      const options = getGroupByOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.map(o => o.value)).toContain('Day');
      expect(options.map(o => o.value)).toContain('Month');
    });
  });
});

describe('ExtensivOrderManager Node', () => {
  describe('Node Description', () => {
    it('should export ExtensivOrderManager class', async () => {
      const { ExtensivOrderManager } = await import('../../nodes/ExtensivOrderManager/ExtensivOrderManager.node');
      expect(ExtensivOrderManager).toBeDefined();
    });

    it('should have correct node properties', async () => {
      const { ExtensivOrderManager } = await import('../../nodes/ExtensivOrderManager/ExtensivOrderManager.node');
      const node = new ExtensivOrderManager();
      
      expect(node.description.displayName).toBe('Extensiv Order Manager');
      expect(node.description.name).toBe('extensivOrderManager');
      expect(node.description.group).toContain('transform');
      expect(node.description.version).toBe(1);
    });

    it('should have all 12 resources', async () => {
      const { ExtensivOrderManager } = await import('../../nodes/ExtensivOrderManager/ExtensivOrderManager.node');
      const node = new ExtensivOrderManager();
      
      const resourceProperty = node.description.properties.find(p => p.name === 'resource');
      expect(resourceProperty).toBeDefined();
      expect(resourceProperty?.type).toBe('options');
      
      const options = resourceProperty?.options as { value: string }[];
      expect(options?.length).toBe(12);
      
      const resourceValues = options?.map(o => o.value);
      expect(resourceValues).toContain('order');
      expect(resourceValues).toContain('product');
      expect(resourceValues).toContain('inventory');
      expect(resourceValues).toContain('purchaseOrder');
      expect(resourceValues).toContain('shipment');
      expect(resourceValues).toContain('customer');
      expect(resourceValues).toContain('warehouse');
      expect(resourceValues).toContain('channel');
      expect(resourceValues).toContain('vendor');
      expect(resourceValues).toContain('listing');
      expect(resourceValues).toContain('return');
      expect(resourceValues).toContain('analytics');
    });

    it('should require credentials', async () => {
      const { ExtensivOrderManager } = await import('../../nodes/ExtensivOrderManager/ExtensivOrderManager.node');
      const node = new ExtensivOrderManager();
      
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials?.length).toBe(1);
      expect(node.description.credentials?.[0].name).toBe('extensivOrderManagerOAuth2Api');
      expect(node.description.credentials?.[0].required).toBe(true);
    });
  });
});

describe('ExtensivOrderManager Trigger Node', () => {
  describe('Trigger Description', () => {
    it('should export ExtensivOrderManagerTrigger class', async () => {
      const { ExtensivOrderManagerTrigger } = await import('../../nodes/ExtensivOrderManager/ExtensivOrderManagerTrigger.node');
      expect(ExtensivOrderManagerTrigger).toBeDefined();
    });

    it('should have correct trigger properties', async () => {
      const { ExtensivOrderManagerTrigger } = await import('../../nodes/ExtensivOrderManager/ExtensivOrderManagerTrigger.node');
      const trigger = new ExtensivOrderManagerTrigger();
      
      expect(trigger.description.displayName).toBe('Extensiv Order Manager Trigger');
      expect(trigger.description.name).toBe('extensivOrderManagerTrigger');
      expect(trigger.description.group).toContain('trigger');
      expect(trigger.description.polling).toBe(true);
    });

    it('should have webhook configuration', async () => {
      const { ExtensivOrderManagerTrigger } = await import('../../nodes/ExtensivOrderManager/ExtensivOrderManagerTrigger.node');
      const trigger = new ExtensivOrderManagerTrigger();
      
      expect(trigger.description.webhooks).toBeDefined();
      expect(trigger.description.webhooks?.length).toBeGreaterThan(0);
    });
  });
});

describe('Credentials', () => {
  it('should export credentials class', async () => {
    const { ExtensivOrderManagerOAuth2Api } = await import('../../credentials/ExtensivOrderManagerOAuth2Api.credentials');
    expect(ExtensivOrderManagerOAuth2Api).toBeDefined();
  });

  it('should have correct credential properties', async () => {
    const { ExtensivOrderManagerOAuth2Api } = await import('../../credentials/ExtensivOrderManagerOAuth2Api.credentials');
    const creds = new ExtensivOrderManagerOAuth2Api();
    
    expect(creds.name).toBe('extensivOrderManagerOAuth2Api');
    expect(creds.displayName).toBe('Extensiv Order Manager OAuth2 API');
  });
});

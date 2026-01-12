# n8n-nodes-extensiv-order-manager

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Extensiv Order Manager (formerly Skubana), providing complete e-commerce order and inventory management automation within n8n workflows. This integration enables access to Extensiv's multi-channel order processing, inventory synchronization, and fulfillment capabilities for high-volume e-commerce operations.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **12 Resource Categories** - Complete coverage of Extensiv Order Manager API
- **80+ Operations** - Comprehensive CRUD and action operations
- **OAuth2 Authentication** - Secure authentication with automatic token refresh
- **Dual Environment Support** - Production and Demo/Sandbox environments
- **Real-time & Polling Triggers** - Webhook and polling-based event detection
- **Multi-channel Support** - Amazon, eBay, Shopify, Walmart, WooCommerce, and more
- **Automatic Pagination** - Handle large datasets seamlessly
- **Rate Limiting** - Built-in exponential backoff for API rate limits

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-extensiv-order-manager`
5. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-extensiv-order-manager
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-extensiv-order-manager.git
cd n8n-nodes-extensiv-order-manager

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-extensiv-order-manager

# Restart n8n
n8n start
```

## Credentials Setup

### OAuth2 Configuration

| Field | Description |
|-------|-------------|
| **Environment** | Select Production or Demo |
| **Client ID** | Your App Key from Extensiv Developer Portal |
| **Client Secret** | Your App Secret from Extensiv Developer Portal |
| **Access Token** | OAuth2 access token |
| **Refresh Token** | OAuth2 refresh token |

### Getting Credentials

1. Register at the [Extensiv Developer Portal](https://developer.extensiv.com)
2. Create a new application with your redirect URI
3. Users install your app from the Extensiv App Store
4. Exchange the authorization code for access/refresh tokens

## Resources & Operations

### Order
Manage e-commerce orders across all channels.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve an order by ID |
| Get Many | List orders with filters |
| Create | Create a new order |
| Update | Update order details |
| Cancel | Cancel an order |
| Ship | Mark order as shipped |
| Update Tracking | Update tracking information |
| Add Note | Add note to order |
| Get Shipments | Get shipments for order |
| Send to Fulfillment | Send order to fulfillment |
| Update Status | Update order status |
| Split | Split order into multiple orders |
| Merge | Merge multiple orders |

### Product
Manage product catalog and variants.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve product by ID or SKU |
| Get Many | List all products |
| Create | Create a new product |
| Update | Update product details |
| Delete | Delete a product |
| Get Variants | Get product variants |
| Create Variant | Create product variant |
| Update Variant | Update variant details |
| Get Inventory | Get inventory for product |
| Update Inventory | Update inventory levels |
| Get Bundles | Get bundle components |
| Create Bundle | Create product bundle |

### Inventory
Manage inventory across warehouses.

| Operation | Description |
|-----------|-------------|
| Get | Get inventory by product/location |
| Get Many | List all inventory |
| Update | Update inventory quantity |
| Adjust | Make inventory adjustment |
| Acknowledge | Acknowledge inventory changes |
| Get History | Get inventory history |
| Reserve | Reserve inventory |
| Unreserve | Release reserved inventory |
| Transfer | Transfer inventory between locations |

### Purchase Order
Manage vendor purchase orders.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve PO by ID |
| Get Many | List all purchase orders |
| Create | Create a new purchase order |
| Update | Update purchase order |
| Cancel | Cancel purchase order |
| Receive | Receive items against PO |
| Close | Close purchase order |
| Add Item | Add item to PO |
| Remove Item | Remove item from PO |
| Approve | Approve purchase order |

### Shipment
Manage shipments and tracking.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve shipment by ID |
| Get Many | List all shipments |
| Create | Create a shipment |
| Update | Update shipment details |
| Cancel | Cancel a shipment |
| Add Package | Add package to shipment |
| Update Tracking | Update tracking info |
| Get Label | Get shipping label |
| Void Label | Void shipping label |

### Customer
Manage customer records.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve customer by ID |
| Get Many | List all customers |
| Create | Create a new customer |
| Update | Update customer details |
| Delete | Delete a customer |
| Get Orders | Get customer's orders |
| Get Addresses | Get customer addresses |
| Add Address | Add customer address |
| Merge | Merge duplicate customers |

### Warehouse
Manage warehouse locations.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve warehouse by ID |
| Get Many | List all warehouses |
| Create | Create a new warehouse |
| Update | Update warehouse details |
| Delete | Delete a warehouse |
| Get Inventory | Get warehouse inventory |
| Get Orders | Get warehouse orders |
| Enable | Enable warehouse |
| Disable | Disable warehouse |

### Channel
Manage sales channels.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve channel by ID |
| Get Many | List all channels |
| Update | Update channel settings |
| Enable | Enable channel |
| Disable | Disable channel |
| Sync | Trigger channel sync |
| Get Listings | Get channel listings |
| Update Listing | Update listing details |

### Vendor
Manage suppliers/vendors.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve vendor by ID |
| Get Many | List all vendors |
| Create | Create a new vendor |
| Update | Update vendor details |
| Delete | Delete a vendor |
| Get Products | Get vendor products |
| Get Purchase Orders | Get vendor POs |
| Add Product | Associate product with vendor |

### Listing
Manage channel listings.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve listing by ID |
| Get Many | List all listings |
| Create | Create a new listing |
| Update | Update listing details |
| Delete | Delete a listing |
| Sync Inventory | Sync listing inventory |
| Sync Price | Sync listing price |
| Enable | Enable listing |
| Disable | Disable listing |

### Return
Manage returns and RMAs.

| Operation | Description |
|-----------|-------------|
| Get | Retrieve return by ID |
| Get Many | List all returns |
| Create | Create a return/RMA |
| Update | Update return details |
| Approve | Approve return |
| Receive | Receive returned items |
| Process | Process refund/exchange |
| Cancel | Cancel return |

### Analytics
Generate reports and analytics.

| Operation | Description |
|-----------|-------------|
| Get Sales Report | Get sales analytics |
| Get Inventory Report | Get inventory analytics |
| Get Order Report | Get order metrics |
| Get Channel Performance | Get channel metrics |
| Get Product Performance | Get product metrics |
| Get Custom Report | Run custom report |

## Trigger Node

The Extensiv Order Manager Trigger node supports both webhook and polling modes.

### Webhook Events
- `order.created` - New order created
- `order.updated` - Order updated
- `order.shipped` - Order shipped
- `order.cancelled` - Order cancelled
- `inventory.updated` - Inventory changed
- `shipment.created` - Shipment created
- `shipment.delivered` - Shipment delivered
- `product.created` - Product created
- `product.updated` - Product updated
- `purchaseOrder.received` - PO received
- `return.created` - Return created
- `return.processed` - Return processed

### Polling Mode
Poll for changes to any resource at configurable intervals (1-60 minutes).

## Usage Examples

### Get Orders by Status

```javascript
// Retrieve all orders with "Processing" status
{
  "resource": "order",
  "operation": "getAll",
  "returnAll": true,
  "additionalFields": {
    "status": "Processing"
  }
}
```

### Create a Product

```javascript
{
  "resource": "product",
  "operation": "create",
  "masterSku": "PROD-001",
  "name": "Sample Product",
  "additionalFields": {
    "price": 29.99,
    "cost": 15.00,
    "weight": 1.5,
    "weightUnit": "lb"
  }
}
```

### Update Inventory

```javascript
{
  "resource": "inventory",
  "operation": "adjust",
  "productId": 12345,
  "warehouseId": 1,
  "quantity": 50,
  "reason": "Stock replenishment"
}
```

### Generate Sales Report

```javascript
{
  "resource": "analytics",
  "operation": "getSalesReport",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "Day"
}
```

## Error Handling

The node includes comprehensive error handling:

- **401 Unauthorized** - Automatic token refresh and retry
- **429 Rate Limited** - Exponential backoff (1s to 120s)
- **400/422 Validation Errors** - Detailed error messages
- **500 Server Errors** - Retry with backoff

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Extensiv API Docs](https://developer.extensiv.com)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-extensiv-order-manager/issues)
- **Email**: support@velobpa.com

## Acknowledgments

- [n8n](https://n8n.io) - The workflow automation platform
- [Extensiv](https://extensiv.com) - Order Manager platform
- [Velocity BPA](https://velobpa.com) - Node development and maintenance

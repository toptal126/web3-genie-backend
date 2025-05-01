# Authentication Module

## Overview

The authentication module handles wallet-based authentication using Solana wallet signatures.

## Flow

1. Get nonce from server
2. Sign nonce with wallet
3. Verify signature with server
4. Receive user session

## Endpoints

### Get Nonce

```http
GET /auth/nonce
```

**Response**

```typescript
{
  nonce: string; // 32-byte hex string
}
```

### Verify Wallet

```http
POST /auth/verify
```

**Headers Required**

```typescript
{
  'x-wallet-address': string;  // User's wallet address
  'x-signature': string;       // Base64 encoded signature
  'x-message': string;         // Nonce to be verified
}
```

**Response**

```typescript
{
  success: boolean;
  user: {
    id: string;
    walletAddress: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

## Error Codes

- `401`: Missing or invalid headers
- `401`: Invalid signature
- `500`: Server error

## Example Usage

```typescript
// 1. Get nonce
const nonceResponse = await fetch('http://localhost:3035/auth/nonce');
const { nonce } = await nonceResponse.json();

// 2. Sign nonce with wallet
const message = new TextEncoder().encode(nonce);
const signature = await wallet.signMessage(message);

// 3. Verify signature
const verifyResponse = await fetch('http://localhost:3035/auth/verify', {
  method: 'POST',
  headers: {
    'x-wallet-address': wallet.publicKey.toString(),
    'x-signature': Buffer.from(signature).toString('base64'),
    'x-message': nonce,
  },
});

const { user } = await verifyResponse.json();
```

# Authentication Module

## Overview

The authentication module handles wallet-based authentication using Solana wallet signatures.

## Flow

1. Get nonce from server (requires wallet address)
2. Sign nonce with wallet
3. Verify signature with server
4. Receive user session

## Endpoints

### Get Nonce

```http
GET /auth/nonce
```

**Headers Required**

```typescript
{
  'x-wallet-address': string;  // User's wallet address
}
```

**Response**

```typescript
{
  nonce: string; // 32-byte hex string
}
```

**Notes**

- If a valid nonce already exists for the wallet address, it will be returned instead of generating a new one
- Nonces expire after 5 minutes
- Rate limited to 5 requests per minute per wallet address

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
    wallet_address: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

## Error Codes

- `401`: Missing or invalid headers
- `401`: Invalid signature
- `400`: Invalid wallet address format
- `500`: Server error

## Example Usage

```typescript
// 1. Get nonce
const nonceResponse = await fetch('http://localhost:3035/auth/nonce', {
  headers: {
    'x-wallet-address': wallet.publicKey.toString(),
  },
});
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

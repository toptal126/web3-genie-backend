# Web3 Genie Backend Documentation

## Overview

This documentation provides detailed information about the Web3 Genie backend API, its modules, and integration guidelines for frontend developers.

## Table of Contents

- [Authentication](./auth.md)
- [Chat System](./chat.md)

## Getting Started

1. Base URL: `http://localhost:3035`
2. All requests must include appropriate headers
3. Authentication is required for protected endpoints

## Common Headers

```typescript
{
  'x-wallet-address': string;  // User's wallet address
  'x-signature': string;       // Base64 encoded signature
  'x-message': string;         // Message to be verified
}
```

## Error Responses

All error responses follow this format:

```typescript
{
  statusCode: number;
  message: string;
  error: string;
}
```

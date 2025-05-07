# Chat Module

## Overview

The chat module provides a secure, wallet-authenticated chat system with AI-powered responses and token analysis capabilities. The system automatically detects and analyzes SPL token addresses in messages, providing detailed token insights.

## Authentication

All chat endpoints require wallet authentication. Include the following headers in your requests:

```typescript
{
  'x-wallet-address': string;  // User's wallet address
  'x-signature': string;       // Base64 encoded signature
  'x-message': string;         // Nonce to be verified
}
```

## Endpoints

### Create Conversation

```http
POST /chat/conversations
```

**Request Body**

```typescript
{
  title: string; // The title of the conversation
}
```

**Response**

```typescript
{
  _id: string;
  user_id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
```

### Get Latest Conversation

```http
GET /chat/conversation
```

**Response**

```typescript
{
  conversation: {
    _id: string;
    user_id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }
  messages: Array<{
    _id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
  }>;
}
```

### Get All Conversations

```http
GET /chat/conversations
```

**Response**

```typescript
Array<{
  _id: string;
  user_id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}>;
```

### Get Specific Conversation

```http
GET /chat/conversation/:id
```

**Response**

```typescript
{
  conversation: {
    _id: string;
    user_id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }
  messages: Array<{
    _id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
  }>;
}
```

### Send Message

```http
POST /chat/message
```

**Request Body**

```typescript
{
  conversationId: string; // The ID of the conversation
  content: string; // The message content (can include SPL token addresses)
}
```

**Response**

```typescript
{
  _id: string;
  conversationId: string;
  role: 'assistant';
  content: string;
  createdAt: string;
}
```

**Token Analysis Integration**

The send message endpoint automatically detects SPL token addresses in the message content. When a valid token address is found:

1. The system fetches comprehensive token data from multiple sources:

   - SolanaFM
   - Solscan
   - Moralis
   - PumpFun
   - Helius

2. The token analysis data is stored in the conversation's `tokenAnalysisData` array for future reference

3. The AI response includes detailed token insights based on:
   - Market metrics
   - On-chain analytics
   - Security assessments
   - Recent news articles

### Delete Conversation

```http
DELETE /chat/conversation/:id
```

**Response**

```typescript
{
  success: boolean;
  message: string;
}
```

## Error Codes

- `401`: Missing or invalid authentication headers
- `401`: Unauthorized access to conversation
- `404`: Conversation not found
- `400`: Invalid token address
- `500`: Server error

## Example Usage

```typescript
// 1. Create a new conversation
const createResponse = await fetch('http://localhost:3035/chat/conversations', {
  method: 'POST',
  headers: {
    'x-wallet-address': wallet.publicKey.toString(),
    'x-signature': signature,
    'x-message': nonce,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ title: 'My First Chat' }),
});

// 2. Send a message with token analysis
const messageResponse = await fetch('http://localhost:3035/chat/message', {
  method: 'POST',
  headers: {
    'x-wallet-address': wallet.publicKey.toString(),
    'x-signature': signature,
    'x-message': nonce,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversationId: conversationId,
    content:
      'Can you analyze this token: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  }),
});

// 3. Get conversation history
const historyResponse = await fetch(
  `http://localhost:3035/chat/conversation/${conversationId}`,
  {
    headers: {
      'x-wallet-address': wallet.publicKey.toString(),
      'x-signature': signature,
      'x-message': nonce,
    },
  },
);
```

## Token Analysis Features

The token analysis system provides:

1. **Market Data**

   - Price and volume metrics
   - Market cap and liquidity information
   - Trading pair statistics

2. **On-chain Analytics**

   - Holder distribution
   - Transaction history
   - Contract interactions

3. **Security Assessment**

   - Contract verification status
   - Liquidity analysis
   - Risk indicators

4. **News Integration**
   - Recent news articles
   - Market sentiment
   - Community updates

All token analysis data is stored in the conversation history for future reference and context.

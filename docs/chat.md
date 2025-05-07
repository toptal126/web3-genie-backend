# Chat Module

## Overview

The chat module provides a secure, wallet-authenticated chat system with AI-powered responses and token analysis capabilities.

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
  id: string;
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
    id: string;
    user_id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }
  messages: Array<{
    id: string;
    conversation_id: string;
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
  id: string;
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
    id: string;
    user_id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }
  messages: Array<{
    id: string;
    conversation_id: string;
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
  content: string; // The message content
}
```

**Response**

```typescript
{
  id: string;
  conversation_id: string;
  role: 'assistant';
  content: string;
  createdAt: string;
}
```

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

### Analyze Token

```http
POST /chat/analyze-token
```

**Request Body**

```typescript
{
  address: string;                    // Token address to analyze
  network?: 'SOLANA_MAINNET';         // Optional network (defaults to Solana mainnet)
  conversationId: string;             // Required conversation ID to continue existing chat
}
```

**Response**

```typescript
{
  id: string;
  conversation_id: string;
  role: 'assistant';
  content: string; // AI-generated token analysis
  createdAt: string;
}
```

## Error Codes

- `401`: Missing or invalid authentication headers
- `401`: Unauthorized access to conversation
- `404`: Conversation not found
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

// 2. Send a message
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
    content: 'Hello, can you analyze this token?',
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

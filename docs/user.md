# User Module

## Overview

The user module manages user profiles and related data.

## User Schema

```typescript
interface User {
  id: string;
  walletAddress: string; // Unique identifier
  createdAt: string;
  updatedAt: string;
}
```

## Endpoints

### Create User

```http
POST /users
```

**Request Body**

```typescript
{
  walletAddress: string; // User's wallet address
}
```

**Response**

```typescript
{
  id: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}
```

### Get All Users

```http
GET /users
```

**Response**

```typescript
[
  {
    id: string;
    walletAddress: string;
    createdAt: string;
    updatedAt: string;
  }
]
```

### Get User by ID

```http
GET /users/:id
```

**Response**

```typescript
{
  id: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}
```

### Get User by Wallet Address

```http
GET /users/wallet/:address
```

**Response**

```typescript
{
  id: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}
```

### Delete User

```http
DELETE /users/:id
```

**Response**

```typescript
{
  success: boolean; // true if deleted successfully
}
```

## Error Codes

- `404`: User not found
- `500`: Server error

## Frontend Integration Example

```typescript
// userService.ts
export class UserService {
  async createUser(walletAddress: string) {
    try {
      const response = await fetch('http://localhost:3035/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress })
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('User creation failed:', error);
      throw error;
    }
  }

  async getUserByWalletAddress(address: string) {
    try {
      const response = await fetch(`http://localhost:3035/users/wallet/${address}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return await response.json();
    } catch (error) {
      console.error('User fetch failed:', error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const response = await fetch(`http://localhost:3035/users/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('User deletion failed:', error);
      throw error;
    }
  }
}

// Usage in React component
import { useEffect, useState } from 'react';
import { UserService } from './userService';

function UserComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userService = new UserService();

  useEffect(() => {
    async function init() {
      try {
        const walletAddress = 'user-wallet-address';
        const userData = await userService.getUserByWalletAddress(walletAddress);
        setUser(userData);
      } catch (error) {
        console.error('User initialization failed:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>ID: {user.id}</p>
      <p>Wallet: {user.walletAddress}</p>
      <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
```

## Error Handling

All API calls should be wrapped in try-catch blocks. The frontend service includes error handling for:

- Network errors
- Invalid responses
- Server errors

## Best Practices

1. Implement proper loading states
2. Cache user data when appropriate
3. Implement proper error boundaries in React components

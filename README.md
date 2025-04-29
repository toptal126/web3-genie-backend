# Web3 Genie Backend

Web3 Genie Backend is a robust API service built with NestJS that provides Web3 integration capabilities, wallet-based authentication, and AI-powered chat functionality. This backend service is designed to support Web3 applications with a focus on security, scalability, and developer experience.

## Overview

Web3 Genie Backend is a robust API service built with NestJS that provides Web3 integration capabilities, wallet-based authentication, and AI-powered chat functionality. This backend service is designed to support Web3 applications with a focus on security, scalability, and developer experience.

## Key Features

- **Web3 Integration**: Connect and interact with blockchain networks
- **Wallet-Based Authentication**: Secure user authentication using wallet addresses
- **AI-Powered Chat**: Intelligent conversational capabilities powered by OpenAI
- **SQLite Database**: Lightweight, efficient data storage
- **RESTful API**: Well-structured endpoints for client applications

## Technology Stack

- **Framework**: NestJS 11.x
- **Runtime**: Node.js 23.x
- **Package Manager**: pnpm
- **Database**: SQLite (via better-sqlite3)
- **AI Integration**: OpenAI API
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js 23 or later
- pnpm package manager
- OpenAI API key (for chat functionality)

### Installation

```bash
$ pnpm install
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
```

### Running the Application

```bash
# Development mode
$ pnpm run start

# Watch mode (recommended for development)
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

## API Endpoints

### Authentication

- `POST /auth/wallet` - Authenticate using a wallet address

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `GET /users/wallet/:address` - Get user by wallet address
- `POST /users` - Create a new user
- `DELETE /users/:id` - Delete a user

## Testing

```bash
# Unit tests
$ pnpm run test

# End-to-end tests
$ pnpm run test:e2e

# Test coverage
$ pnpm run test:cov
```

## Project Structure

The application follows the standard NestJS modular architecture:

- `src/app.module.ts` - Main application module
- `src/auth` - Authentication functionality
- `src/user` - User management
- `src/chat` - OpenAI integration for chat capabilities
- `src/web3` - Web3 integration services
- `src/database` - Database connection and services
- `src/admin` - Administrative functionality

## Deployment

For production deployment, build the application and run it with Node.js:

```bash
$ pnpm run build
$ pnpm run start:prod
```

For detailed deployment options and best practices, refer to the [NestJS deployment documentation](https://docs.nestjs.com/deployment).

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

This project is [MIT licensed](LICENSE).

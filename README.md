# Test DataLouna Project

This project is a test assignment that implements the following features:

1. **User Authentication**:
    - Registration, login, and password change functionality.
    - Managed using a secure hashing mechanism.

2. **Price Service**:
    - Fetches item prices from the [Skinport API](https://docs.skinport.com/#items).
    - Implements caching using Redis.
    - Supports two price types: `tradable` and `non-tradable`.

3. **Purchase Service**:
    - Allows users to purchase products from a `products` table.
    - Updates the user's balance and creates a purchase entry in the database.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 18 or later.
- **Docker**: For running PostgreSQL and Redis in containers.
- **Postman**: For API testing.

---

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up `.env` file:
   Create a `.env` file in the root directory with the following variables:
   ```env

   ```

3. Start Docker containers for PostgreSQL and Redis:
   ```bash
   podman-compose up
   ```

4. Apply database migrations:
   ```bash
   docker exec -it test_datalouna_postgres_1 bash
   psql -U postgres -d local_db -f /path/to/migrations.sql
   ```
5. Run the application:
   ```bash
   npm run start:local
   ```

---

## API Endpoints

### Authentication Service

- **POST** `/AuthService/register`:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- **POST** `/AuthService/login`:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- **POST** `/AuthService/change-password`:
  ```json
  {
    "email": "test@example.com",
    "oldPassword": "password123",
    "newPassword": "newpassword123"
  }
  ```

### Price Service

- **GET** `/items/prices`:
  Fetches item prices, including `tradable` and `non-tradable` prices.

### Purchase Service

- **POST** `/purchase`:
  ```json
  {
    "userId": 1,
    "productId": 2,
    "quantity": 2
  }
  ```

  Response:
  ```json
  {
    "balance": 40
  }
  ```

---

## Testing

Run unit tests using:
```bash
npm test
```

---

## Postman Collection

Import the provided Postman collection to test the API endpoints

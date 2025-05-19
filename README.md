# Money Transfer Service

This project is a comprehensive API and web interface service that allows money transfers between users. It is developed using Node.js, Express, TypeScript, SQLite, Prisma, and React.

## Features

- Instant money transfers between users
- Scheduled transfers
- Transaction history viewing
- Idempotent API support
- Atomic transactions
- Modern and user-friendly interface

## Technology Stack

### Backend
- Node.js + TypeScript
- Express.js
- SQLite (Prisma ORM)
- Winston (Logging)

### Frontend
- React + TypeScript
- React Router
- Mantine UI
- Axios

## Requirements

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the project:
```bash
git clone <repo-url>
cd money-transfer-service
```

2. Install backend dependencies and set up the database:
```bash
npm install
npx prisma migrate dev --name init
npm run seed
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

## Running the Application

### Backend 
To start in development mode:
```bash
# In the root directory
npm run dev
```

### Frontend
To start in development mode:
```bash
# In the client directory
npm run dev
```

The backend runs on port 3000 by default, and the frontend runs on port 5173.

## API Endpoints

### Users

#### Get all users
```
GET /api/users
```

#### Get user details
```
GET /api/users/:id
```

#### Create a new user
```
POST /api/users
```
```json
{
  "name": "User Name",
  "balance": 1000
}
```

### Transfers

#### Make a transfer
```
POST /api/transfer
```
```json
{
  "senderId": 1,
  "receiverId": 2,
  "amount": 500,
  "description": "Payment description",
  "scheduledAt": "2023-12-31T10:00:00Z" // Optional
}
```

For idempotency:
```
POST /api/transfer
Idempotency-Key: unique-operation-id
```

#### Get transaction history
```
GET /api/transactions?user_id=1
```

## Transfer Rules

- The sender's balance must be sufficient for the transfer amount
- The transfer amount must be greater than 0
- A user cannot transfer money to themselves
- Scheduled transfers are automatically executed at the planned time

## Screenshots
<img width="1710" alt="Ekran Resmi 2025-05-19 13 54 39" src="https://github.com/user-attachments/assets/15445f33-b78a-49c0-b7ef-d032a9497051" />


<img width="1082" alt="Ekran Resmi 2025-05-18 21 49 58" src="https://github.com/user-attachments/assets/502a6222-ab0d-4da8-ac83-51b5e9b9119e" />

<img width="1082" alt="Ekran Resmi 2025-05-18 21 49 51" src="https://github.com/user-attachments/assets/c0e05aeb-a491-4327-a5de-037f4dc71c6c" />

## Testing

To run backend tests:
```bash
# In the root directory
npm test
```

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT](LICENSE) License. 

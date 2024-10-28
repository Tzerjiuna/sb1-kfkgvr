# Payment Gateway System

A complete payment gateway system with frontend and backend components.

## Requirements

- Docker
- Docker Compose
- Git
- Node.js (for local development)
- PHP 8.1+ (for local development)
- MySQL 8.0+ (for local development)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/payment-gateway.git
cd payment-gateway
```

2. Copy environment files:
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

3. Start the services:
```bash
./deploy.sh
```

4. Access the services:
- Frontend: http://localhost:8080
- Backend API: http://localhost:9001
- MySQL: localhost:3307

## Development

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

### Backend (PHP)

```bash
cd backend
composer install
php -S localhost:9001
```

### Database

The database will be automatically initialized with sample data when you run `deploy.sh`.

## Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:9001
```

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3307
DB_DATABASE=payment_gateway
DB_USERNAME=payment_user
DB_PASSWORD=payment_password
```

## API Documentation

### Available Endpoints

- GET /check/alladdr.php - Get all payment addresses
- POST /check/verify.php - Verify a transaction
- POST /check/call.php - Submit a payment
- GET /check/withdraw.php - Get withdrawal list
- POST /check/withdraw.php - Submit withdrawal request

## License

MIT License
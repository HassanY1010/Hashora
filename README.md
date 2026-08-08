# Cloud Mining SaaS Platform — USDT (TRC20)

An enterprise-grade, high-performance Cloud Mining SaaS Platform built with **NestJS**, **TypeScript**, **Next.js/React**, **PostgreSQL**, and **Prisma ORM**.

---

## 🚀 Key Features

### For Users:
- **USDT (TRC20) Support**: Instant deposits via TRON network with QR codes and TRC20 wallet addresses.
- **Mining Plans**: Purchase Starter (20 USDT / 100 MH/s), Pro (100 USDT / 700 MH/s), or Premium (500 USDT / 4,500 MH/s) contracts.
- **Automated Yield Engine**: Hourly yield distribution calculated based on active contract hashrate and dynamic system reward rate.
- **3-Tier Referral Payouts**: Earn instant commissions on plan purchases (Level 1: 5%, Level 2: 3%, Level 3: 1%).
- **Withdrawal Engine**: Payout requests with minimum threshold (10 USDT), flat fee (1 USDT), and TRON address validation.
- **Interactive Calculator & Performance Analytics**: Real-time yield calculator and 30-day interactive performance charts.

### For Admins & Super Admins:
- **Comprehensive Overview Dashboard**: Monitor real-time counts, financial volume (deposits/withdrawals), total platform hashrate, and live activity feeds.
- **User Control Panel**: Search users, adjust wallet balance (+/- USDT with mandatory audit reason), adjust hashrate, pause mining, or ban accounts.
- **Plans Manager**: Create, edit, and update mining packages.
- **Approval Queues**: Review deposit and withdrawal requests with manual TXID insertion.
- **Dynamic System Settings**: Configure daily `REWARD_RATE`, `MIN_WITHDRAWAL_AMOUNT`, `WITHDRAWAL_FEE`, and receiver address.
- **Immutable Audit Logs**: Record every admin action for security compliance.

---

## 🛠️ Technology Stack

- **Backend**: NestJS (TypeScript), Prisma ORM, PostgreSQL, Passport JWT, Bcrypt, Schedule (Cron), Swagger OpenAPI.
- **Frontend**: React, TypeScript, Vite, React Router, Lucide Icons, Custom CSS Glassmorphism Design System.
- **Database**: PostgreSQL (ACID Financial Transactions).
- **Deployment**: Docker, Docker Compose, Nginx.

---

## ⚡ Quick Start Guide (Local Development)

### 1. Database Setup
Ensure PostgreSQL is running locally or via Docker:
```bash
docker run --name cloudmining-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
```

### 2. Backend API Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```
- API Base URL: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api/docs`

### 3. Frontend App Setup
```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:3000`

---

## 🔑 Default Credentials

- **Super Admin**: `superadmin@platform.com` / `SuperAdmin123@`
- **Admin Login Portal**: `http://localhost:3000/admin/login`

---

## 🐳 Docker Production Deployment

To launch the full production environment in containerized mode:
```bash
docker-compose up --build -d
```

---

## 📚 API Endpoints Summary

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | User login & JWT issuance | Public |
| `POST` | `/api/auth/admin/login` | Admin portal login | Public |
| `GET` | `/api/plans` | List active mining plans | Public |
| `POST` | `/api/contracts/create` | Purchase plan & create contract | JWT User |
| `GET` | `/api/wallet` | Get user multi-balance wallet | JWT User |
| `GET` | `/api/deposits/address` | Get TRC20 address & QR code | JWT User |
| `POST` | `/api/withdraw/create` | Submit withdrawal request | JWT User |
| `GET` | `/api/referrals` | Referral link & 3-tier logs | JWT User |
| `GET` | `/api/admin/dashboard-stats` | Platform metrics & feed | Admin |
| `PUT` | `/api/users/admin/:id/balance`| Adjust balance with audit log | Admin |
| `PUT` | `/api/admin/settings` | Update global settings | Admin |

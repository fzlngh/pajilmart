# PajilMart

**A Full-Stack E-Commerce Platform Built with JavaScript**

PajilMart is a full-stack e-commerce application designed to provide an integrated online shopping and in-store transaction experience. Built with Next.js, Express.js, Supabase, and Midtrans, PajilMart supports multiple user roles with dedicated features for customers, cashiers, and administrators.

The platform combines online shopping, Point of Sale (POS), product management, order management, and secure payment processing in one unified system.

---

## Features

### 1. Customer
- Self-service account registration and authentication.
- Browse available products and product details.
- Add products to the shopping cart.
- Checkout and complete purchases.
- Multiple payment methods through Midtrans.
- View and track order status.

### 2. Cashier
- Dedicated cashier dashboard.
- In-store transactions through Point of Sale (POS).
- Select products and manage transaction quantities.
- Process cash payments.
- Process non-cash payments through Midtrans.
- Access cashier-specific transaction functionality.

> Cashier accounts can only be created and managed by administrators. Public cashier registration is not available.

### 3. Administrator
- Admin dashboard for centralized management.
- Create, update, and delete products.
- Upload and manage product images.
- Create and manage cashier accounts.
- Monitor all customer and cashier orders.
- Track transaction status and total revenue.
- Manage the overall e-commerce operation.

### 4. Payment Integration
- Integrated with Midtrans Payment Gateway.
- Supports multiple payment methods enabled in the Midtrans dashboard.
- Virtual Account payments.
- QRIS payments.
- E-wallet payments.
- Credit card payments.
- Convenience store payments.
- Automated payment status updates through Midtrans Webhooks.
- SHA-512 signature verification for payment notifications.

### 5. Authentication & Security
- Supabase-based authentication and user management.
- Role-based access control (RBAC).
- Automatic customer account activation.
- Admin-only cashier account creation.
- Protected backend API endpoints.
- Supabase Row Level Security (RLS).
- Sensitive credentials are stored exclusively on the backend.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| JavaScript | Main programming language |
| Next.js | Frontend framework |
| React.js | User interface |
| Express.js | Backend REST API |
| Supabase | Database, authentication, and storage |
| PostgreSQL | Relational database |
| Midtrans | Payment gateway |
| Node.js | Backend runtime |
| npm | Package management |

---

## System Architecture

PajilMart uses a separated frontend and backend architecture to improve maintainability and security.

```text
                 ┌─────────────────────┐
                 │       Users         │
                 │                     │
                 │ Customer / Cashier  │
                 │       Admin         │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │      Next.js        │
                 │      Frontend       │
                 │                     │
                 │ Customer UI         │
                 │ Cashier POS         │
                 │ Admin Dashboard     │
                 └──────────┬──────────┘
                            │
                       REST API
                            │
                            ▼
                 ┌─────────────────────┐
                 │     Express.js      │
                 │      Backend        │
                 │                     │
                 │ Authentication      │
                 │ Product Management  │
                 │ Order Management    │
                 │ Payment Processing  │
                 └──────┬────────┬─────┘
                        │        │
              ┌─────────▼──┐  ┌──▼─────────┐
              │  Supabase  │  │  Midtrans  │
              │            │  │            │
              │ PostgreSQL │  │  Payments  │
              │ Auth       │  │  Webhooks  │
              │ Storage    │  │            │
              └────────────┘  └────────────┘
```

---

## Project Structure

```text
ecommerce-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── kasir/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.js
│   │
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── .env.local.example
│   └── package.json
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## Installation & Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- Supabase Account
- Midtrans Account

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/PajilMart.git

cd PajilMart
```

### 2. Configure Supabase

1. Create a new project at [Supabase](https://supabase.com).
2. Open the SQL Editor.
3. Execute the entire SQL script from `database/schema.sql`.
4. Navigate to **Storage** and create a bucket named `product-images`.
5. Enable **Public Bucket** to allow product images to be accessed by the frontend.

#### Create the First Administrator

1. Navigate to **Authentication → Users → Add User**.
2. Enter the administrator email and password.
3. Enable **Auto Confirm User**.
4. Copy the generated user UUID.
5. Execute the following SQL query:

```sql
INSERT INTO public.profiles (id, full_name, role)
VALUES ('YOUR_ADMIN_UUID', 'Super Admin', 'admin');
```

#### Retrieve Supabase Credentials

Navigate to **Project Settings → API** and obtain:

| Credential | Environment Variable |
|---|---|
| Project URL | `SUPABASE_URL` |
| Service Role Key | `SUPABASE_SERVICE_ROLE_KEY` |

Keep your Service Role Key private. Never expose it in frontend code or public repositories.

### 3. Configure Midtrans

1. Create an account at [Midtrans Dashboard](https://dashboard.midtrans.com).
2. Use **Sandbox Mode** for development.
3. Navigate to **Settings → Access Keys**.
4. Obtain your Server Key and Client Key.
5. Configure the Payment Notification URL:

```text
https://YOUR_BACKEND_DOMAIN/api/payment/notification
```

For local development, use [ngrok](https://ngrok.com) to expose your backend endpoint.

Enable the payment methods you want to support in the Midtrans Sandbox Dashboard.

Available methods depend on your Midtrans account configuration and enabled payment channels.

### 4. Run Backend

```bash
cd backend

cp .env.example .env

npm install

npm run dev
```

The backend API will run at:

```text
http://localhost:4000
```

Configure the backend environment variables:

```env
PORT=4000

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false
```

### 5. Run Frontend

Open another terminal:

```bash
cd frontend

cp .env.local.example .env.local

npm install

npm run dev
```

Configure the frontend environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api

NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

The frontend application will run at:

```text
http://localhost:3000
```

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Customer homepage |
| `/login` | User authentication |
| `/register` | Customer registration |
| `/admin` | Administrator dashboard |
| `/admin/products` | Product management |
| `/admin/kasir` | Cashier account management |
| `/admin/orders` | Order management |
| `/kasir` | Cashier POS dashboard |

---

## User Workflow

| Role | Authentication | Main Functionality |
|---|---|---|
| Customer | `/login` | Shopping, cart, checkout, and order tracking |
| Cashier | `/login` | In-store POS transactions |
| Admin | `/login` | Product, cashier, order, and revenue management |

After successful authentication, users are redirected according to their assigned roles.

- Customer → `/`
- Cashier → `/kasir`
- Admin → `/admin`

---

## Security Implementation

PajilMart implements several security mechanisms to protect user data and application operations.

**Role-Based Access Control (RBAC)**

Each user has a specific role: `customer`, `cashier`, or `admin`. Protected endpoints validate user permissions before allowing sensitive operations.

**Supabase Admin API**

Customer registration uses the Supabase Admin API with `email_confirm: true`, allowing newly registered customers to access their accounts immediately without the default Supabase email confirmation process.

**Admin-Only Operations**

Product modifications and cashier account management are restricted to administrator accounts.

**Environment Variable Protection**

The Supabase Service Role Key and Midtrans Server Key are exclusively stored on the backend.

**Midtrans Webhook Verification**

Payment notifications are validated using SHA-512 signature verification before updating transaction statuses.

**Row Level Security (RLS)**

Supabase RLS policies provide an additional database-level access control layer.

---

## Payment Flow

```text
Customer / Cashier
        │
        ▼
   Create Order
        │
        ▼
  Express.js Backend
        │
        ▼
   Midtrans Snap
        │
        ▼
  Payment Selection
        │
        ▼
  Payment Processing
        │
        ▼
 Midtrans Notification
        │
        ▼
 SHA-512 Verification
        │
        ▼
 Update Order Status
        │
        ▼
 Supabase Database
```

Payment status updates are handled through Midtrans Webhooks to ensure that transaction status is synchronized with the backend.

---

## Important Notes

- Customer registration does not require default Supabase email confirmation.
- Cashier accounts cannot register independently.
- Only administrators can manage products and cashier accounts.
- The Supabase Service Role Key must never be exposed to the frontend.
- Midtrans payment notifications must be verified before updating order statuses.
- Use Midtrans Sandbox Mode during development.
- Configure production credentials and HTTPS before deploying the application.

---

## Future Development

Potential improvements for future releases:

- Advanced sales analytics and reporting.
- Product inventory and stock management.
- Discount and voucher management.
- Customer order history and invoices.
- Transaction export to CSV or PDF.
- Improved dashboard analytics.
- Automated sales notifications.

---

## License

This project is developed for educational and software engineering purposes.

---

**PajilMart — Simplifying Online Shopping and In-Store Transactions.**
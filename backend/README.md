# ResQConnect Backend

Production-grade Node.js/Express.js backend for the **ResQConnect** post-disaster recovery and coordination platform.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (Current environment: v24+)
- **MongoDB Atlas Cluster**: Connected & verified (`ResQConnect` database)

---

## 2. Setup & Installation (Windows PowerShell)

Open PowerShell in the project directory:

```powershell
# Navigate to the backend directory
cd D:\undooo\ResQConnect-main\backend

# Install dependencies
npm install
```

---

## 3. Environment Configuration

Ensure `backend/.env` is configured with your Atlas connection string:

```ini
PORT=5000
NODE_ENV=development

# MongoDB Atlas URI
MONGODB_URI=mongodb+srv://<username>:<password>@resqconnect.3bjtjln.mongodb.net/ResQConnect?retryWrites=true&w=majority&appName=ResQConnect

# JWT Authentication
JWT_SECRET=your_secure_jwt_secret_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Cookie Signing
COOKIE_SECRET=your_secure_cookie_signing_secret

# Frontend URL
CLIENT_ORIGIN=http://localhost:5173
```

> **Security Note**: Never commit the `.env` file to version control. It is ignored by `.gitignore`.

---

## 4. Database Seeding (Demo Personas & Initial Mock Data)

To seed development demo accounts, relief resources, recovery hubs, and requests:

```powershell
npm run seed
```

This populates the database with:
- **Citizen**: `rahul.sharma@example.com`
- **Volunteer**: `priya.mehta@example.com`
- **Relief NGO**: `contact@helpinghands.org`
- **System Admin**: `admin@resqconnect.org`
- **Default Development Password**: `ResQDemo@2026!`
- **Initial Inventory**: 10 categorized disaster relief resources
- **Initial Recovery Hubs**: 5 operational civic recovery hubs
- **Initial Assistance Requests**: 8 seeded recovery requests (`RQ-1018` through `RQ-1025`)

*(Note: The seeder is strictly disabled in production and idempotent in development — it will never overwrite existing records).*

---

## 5. Running the Server

### Development Mode (with native Node auto-reload):
```powershell
npm run dev
```

### Production Mode:
```powershell
npm start
```

---

## 6. Running Automated Tests

Run the full automated test suite (covering unit checks, authentication, authorization, request lifecycle, inventory allocation, and admin security guards):

```powershell
npm test
```

---

## 7. API Reference Matrix

### System & Health (`/api/health`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | Live health-check & database connectivity status |

### Authentication (`/api/auth`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register Citizen, Volunteer, or NGO (Admin registration blocked with 403) |
| `/api/auth/login` | `POST` | Public | Authenticate user, return JWT & set HttpOnly cookie |
| `/api/auth/me` | `GET` | Private | Returns current authenticated user profile |
| `/api/auth/logout` | `POST` | Public | Invalidate browser session cookies |
| `/api/auth/demo-switch` | `POST` | Dev Only | Authenticate as real seeded demo persona |

### Assistance Requests (`/api/requests`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/requests` | `GET` | Private | List requests scoped by role (Citizens see own; Volunteers see assigned & pool; NGOs/Admins see all) |
| `/api/requests/:id` | `GET` | Private | Get single request details by custom ID (`RQ-1025`) or ObjectId |
| `/api/requests` | `POST` | Citizen | Lodge new assistance request (auto-generates sequential `RQ-xxxx` ID, timeline, and notification) |
| `/api/requests/:id/status` | `PATCH` | NGO, Admin | Transition status (`Submitted` &rarr; `Under Verification` &rarr; `Verified` &rarr; `Matched` &rarr; `In Progress` &rarr; `Completed` &rarr; `Closed`, or `Rejected`) |
| `/api/requests/:id/volunteer/claim` | `POST` | Volunteer | Claim eligible verified task (status advances to `Assistance In Progress`) |
| `/api/requests/:id/volunteer/checkin` | `POST` | Assigned Volunteer | Post on-site progress note with author and timestamp |
| `/api/requests/:id/volunteer/complete` | `POST` | Assigned Volunteer | Mark mission completed with delivery proof |
| `/api/requests/:id/ngo/assign` | `POST` | NGO, Admin | Assign available verified volunteer to request |
| `/api/requests/:id/ngo/allocate` | `POST` | NGO, Admin | Allocate inventory with atomic stock deduction (prevents negative stock) |
| `/api/requests/:id/flag` | `PATCH` | Admin | Flag or unflag suspicious/duplicate request |

### Relief Resources & Inventory (`/api/resources`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/resources` | `GET` | Public/Private | List inventory items with stock status (`In Stock`, `Low Stock`, `Critical`) |
| `/api/resources` | `POST` | NGO, Admin | Add new warehouse inventory item |
| `/api/resources/:id` | `PATCH` | NGO, Admin | Update stock quantity or status |

### Recovery Hubs (`/api/hubs`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/hubs` | `GET` | Public | Public directory of physical recovery hubs |
| `/api/hubs` | `POST` | Admin | Create/register a new recovery hub |

### Notifications (`/api/notifications`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/notifications` | `GET` | Private | List authenticated user's private notifications |
| `/api/notifications/:id/read` | `PATCH` | Private | Mark single notification as read |
| `/api/notifications/read-all` | `PATCH` | Private | Mark all user notifications as read |
| `/api/notifications/:id` | `DELETE` | Private | Delete private notification |

### Administration (`/api/admin`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/admin/users` | `GET` | Admin | List users and pending verification queues |
| `/api/admin/users/:id/verify` | `PATCH` | Admin | Approve volunteer or NGO partner credentials |
| `/api/admin/users/:id/reject` | `PATCH` | Admin | Reject volunteer or NGO credentials with reason |
| `/api/admin/audit-logs` | `GET` | Admin | Query immutable system audit log entries |
| `/api/admin/requests/:id/flag` | `PATCH` | Admin | Flag/unflag requests |
| `/api/admin/reset-demo-data` | `POST` | Admin (Dev Only) | Reset & reseed demonstration dataset (strictly disabled in production) |

---

## 8. Security Architecture Implemented

1. **Role Registration Guard**: Public registration with the `admin` role is strictly rejected with HTTP 403.
2. **Atomic Inventory Allocations**: Uses `$gte` filters on Mongoose updates to prevent negative stock and race conditions under concurrent allocation attempts.
3. **Double-Submit CSRF Protection**: Issues client-readable `XSRF-TOKEN` cookie paired with HttpOnly `resq_token` session cookie.
4. **Data Isolation**: Citizens cannot view other citizens' requests or notifications.
5. **Partner Verification**: Unverified volunteer or NGO accounts are restricted from operational task claiming or assigning.
6. **No Secret Leaks**: Passwords, hashes, and database credentials are excluded from responses, logs, and Git.

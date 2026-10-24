# MiniLedger

MiniLedger is a cheerful React Native app for remembering money lent to friends. It includes mock phone-number authentication, a PostgreSQL-backed ledger, repayment tracking, overdue highlighting, and a live financial summary.

## What is included

- Mock phone login with a six-digit OTP printed in the API terminal
- JWT-protected API and persistent mobile session
- Add a loan with friend name, amount, and due date
- Mark a loan as repaid
- Total lent, repaid, outstanding, and overdue summary
- Colourful responsive UI for Android, iOS, and web
- Exact money calculations using integer paise
- PostgreSQL migration and Docker Compose setup
- Unit tests for money, phone, date, validation, and summary logic

Receipt upload is intentionally left as a future bonus so the required assignment remains compact and easy to explain.

## Project structure

```text
mini-ledger/
├── apps/
│   ├── api/
│   │   ├── prisma/                 # Schema and SQL migration
│   │   ├── src/
│   │   │   ├── middleware/auth.ts  # JWT protection
│   │   │   ├── routes/auth.ts      # OTP request and verification
│   │   │   ├── routes/loans.ts     # List, create, and repay loans
│   │   │   ├── routes/summary.ts   # Dashboard totals
│   │   │   ├── utils/              # Money, date, phone, JWT, summary helpers
│   │   │   ├── app.ts              # Express application
│   │   │   └── server.ts           # HTTP server entry point
│   │   └── tests/utils.test.ts
│   └── mobile/
│       ├── app/                     # Expo Router screens
│       │   ├── login.tsx
│       │   ├── home.tsx
│       │   └── add-loan.tsx
│       └── src/                     # API, session, design tokens, components
├── .env.example
├── docker-compose.yml
└── package.json                     # npm workspace commands
```

## Technology

- **API:** Node.js, TypeScript, Express 5, Prisma 7, Zod, JWT
- **Database:** PostgreSQL 17
- **App:** React Native, Expo SDK 58, Expo Router, SecureStore
- **Tests:** Vitest

## Prerequisites

- Node.js 22.13 or newer
- npm 10 or newer
- Docker Desktop with Docker Compose
- For a physical phone: Expo Go compatible with the selected Expo SDK

The project also works in a browser, so a phone or emulator is not required for the first run.

## First-time setup

Run every command below from the repository root unless a section says otherwise.

### 1. Install dependencies

```powershell
npm install
```

### 2. Create the local environment file

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

The included development values work with Docker Compose. Before deploying anywhere, replace `JWT_SECRET` with a long random secret.

### 3. Start PostgreSQL

Make sure Docker Desktop is running, then execute:

```powershell
npm run db:up
```

Confirm the container is healthy:

```powershell
docker compose ps
```

You should see `miniledger-postgres` with a healthy status.

### 4. Apply the database migration

```powershell
npm run db:generate
npm run db:migrate
```

The checked-in migration creates the `User` and `Loan` tables. Re-running the command is safe; Prisma reports that the database is already in sync.

### 5. Configure the mobile API address

Create the mobile environment file:

```powershell
Copy-Item apps/mobile/.env.example apps/mobile/.env
```

Choose the URL for the way you will run the app:

| Where the app runs | `EXPO_PUBLIC_API_URL` |
|---|---|
| Web browser | `http://localhost:4000/api` |
| iOS simulator | `http://localhost:4000/api` |
| Android emulator | `http://10.0.2.2:4000/api` |
| Physical phone | `http://YOUR_COMPUTER_LAN_IP:4000/api` |

To find a Windows LAN address, run `ipconfig` and look for the active adapter’s IPv4 address. The phone and computer must be on the same network. Allow Node.js through Windows Firewall if prompted.

## Starting the full project

The database runs in Docker. The API and mobile app run in separate terminals.

### Terminal 1 — database

```powershell
npm run db:up
```

Docker keeps this service running in the background. You do not need to leave the terminal open.

### Terminal 2 — backend API

```powershell
npm run dev:api
```

Expected output:

```text
MiniLedger API is running at http://localhost:4000
```

Test it in a browser at [http://localhost:4000/health](http://localhost:4000/health). The response should be:

```json
{"status":"ok","service":"miniledger-api"}
```

Keep this terminal visible: it prints the mock OTP during login.

### Terminal 3 — React Native app

```powershell
npm run dev:mobile
```

Expo displays a QR code and keyboard shortcuts:

- Press `w` to open the web app.
- Press `a` to open an installed Android emulator.
- Scan the QR code with Expo Go to use a physical device.
- On macOS, press `i` to open the iOS simulator.

If you change `apps/mobile/.env`, stop Expo and restart it so the API address is reloaded.

## Using the app

### Log in

1. Enter a 10-digit Indian phone number, such as `9876543210`. Numbers already containing a country code also work.
2. Tap **Send my OTP**.
3. Look at the backend terminal. It prints a line similar to:

   ```text
   [MiniLedger OTP] +919876543210 -> 482193 (valid for 5 minutes)
   ```

4. Enter those six digits in the app.
5. Tap **Open my ledger**.

No SMS is sent. OTP values live only in API memory, expire after five minutes, and disappear when the API restarts.

### Add a loan

1. Tap the yellow **Lent something?** card.
2. Enter the friend’s name and amount in rupees.
3. Enter a due date as `YYYY-MM-DD`, or use a `+7`, `+14`, or `+30 days` shortcut.
4. Tap **Save to my ledger**.

To demonstrate overdue styling, create an entry with a valid date before today. A due date equal to today is not considered overdue.

### Mark a loan repaid

1. Find an active loan on the home screen.
2. Tap **Mark as repaid**.
3. Confirm the action.

The card changes to the repaid style and every summary amount refreshes automatically.

### Refresh and sign out

- Pull down on the home list to refresh it.
- Tap the square arrow button in the upper-right corner to sign out.

## API reference

The base URL is `http://localhost:4000/api`.

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/auth/request-otp` | No | Generate and log an OTP |
| `POST` | `/auth/verify-otp` | No | Verify OTP and return a JWT |
| `GET` | `/loans` | Bearer token | List the current user’s loans |
| `POST` | `/loans` | Bearer token | Create a loan |
| `PATCH` | `/loans/:id/repaid` | Bearer token | Mark a loan repaid |
| `GET` | `/summary` | Bearer token | Return dashboard totals |

### Example loan body

```json
{
  "friendName": "Asha",
  "amount": 1250.50,
  "dueDate": "2026-11-10"
}
```

### Summary definitions

- `totalLent`: every loan ever recorded
- `totalRepaid`: loans marked as repaid
- `outstanding`: lent minus repaid
- `overdueAmount`: outstanding loans with due dates before today

All protected endpoints scope database queries to the user ID inside the JWT.

## Useful development commands

```powershell
# Type-check API and mobile app
npm run typecheck

# Run backend tests
npm test

# Build the backend
npm run build

# Open Prisma's database browser
npm run db:studio

# Follow PostgreSQL logs
npm run db:logs

# Stop PostgreSQL without deleting its stored data
npm run db:down
```

To also delete the local database volume and start over:

```powershell
docker compose down --volumes
```

This permanently removes the local MiniLedger database contents.

## How the code works

### Authentication flow

1. The mobile app posts a phone number to `/auth/request-otp`.
2. The backend normalizes it to an international form. A bare 10-digit number receives the `+91` prefix.
3. A secure random six-digit OTP is saved in an in-memory `Map` for five minutes and printed to the API log.
4. `/auth/verify-otp` checks and consumes the OTP, creates the user if necessary, and returns a seven-day JWT.
5. The app stores the JWT in SecureStore on mobile or local storage on web.
6. Future API requests send `Authorization: Bearer <token>`.

### Money handling

The API converts rupees to integer paise before saving. For example, ₹1,250.75 becomes `125075`. This avoids floating-point rounding errors when calculating totals. API responses convert the value back to rupees for the UI.

### Overdue calculation

Due dates are stored as PostgreSQL `DATE` values and transferred as `YYYY-MM-DD`. An entry is overdue only when it is outstanding and its date is earlier than the current UTC calendar date.

### UI organization

Expo Router maps files in `apps/mobile/app` to screens:

- `index.tsx` restores the saved session and redirects appropriately.
- `login.tsx` contains the phone and OTP steps.
- `home.tsx` loads loans and summary information.
- `add-loan.tsx` validates and submits a new entry.

Reusable display pieces live in `apps/mobile/src/components`. The colour palette lives in `src/theme.ts`, making visual changes straightforward.

## Tests

Run:

```powershell
npm test
```

The test suite does not require PostgreSQL. It verifies the deterministic business rules independently:

- Phone-number normalization and validation
- Real calendar-date validation
- Rupee/paise conversion
- Maximum two decimal places
- Lent, repaid, outstanding, and overdue totals
- Due-today behavior

## Troubleshooting

### The app says `Network request failed`

- Confirm the API terminal is running.
- Open `/health` in your computer’s browser.
- If using a phone, do not use `localhost`; use the computer’s LAN IP.
- Confirm both devices are on the same network.
- Restart Expo after changing `EXPO_PUBLIC_API_URL`.

### PostgreSQL port 49160 is already in use

MiniLedger deliberately maps PostgreSQL to host port `49160` to avoid the common local `5432` conflict. Stop the other service, or change the left side of the Compose port mapping and update `DATABASE_URL` to match.

### Docker reports that it cannot connect

Start Docker Desktop and wait until it reports that the engine is running, then retry `npm run db:up`.

### Prisma cannot find `DATABASE_URL`

Confirm that `.env` exists in the repository root and was copied from `.env.example`. Run Prisma through the root npm commands so it uses the intended working directory.

### The OTP no longer works

Request a new one. OTPs expire after five minutes, can only be used once, and are cleared whenever the backend restarts.

## Suggested 2–3 minute recording

1. Briefly show the repository and README.
2. Open the login screen and request an OTP.
3. Show the OTP line in the API terminal, then complete login.
4. Add a normal future-due loan.
5. Add an entry using a past date to show overdue highlighting.
6. Point out total lent, repaid, outstanding, and overdue amounts.
7. Mark one entry repaid and show the instant summary update.
8. End on the colourful dashboard and mention the test command.

## Publishing to GitHub

After you have reviewed the code and replaced any personal details you want to change:

```powershell
git init
git add .
git commit -m "Build MiniLedger internship assignment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mini-ledger.git
git push -u origin main
```

Create the empty `mini-ledger` repository on GitHub before adding the remote, or use the GitHub CLI:

```powershell
gh repo create mini-ledger --public --source . --remote origin --push
```

Do not commit `.env`; it is already ignored. After uploading your Loom or Google Drive recording, add its public viewing link near the top of this README.

## Deliberate scope choices

- OTP storage is in memory because the assignment explicitly requests a mock OTP. A real system would use an SMS provider, hashed challenges, rate limits, and shared expiring storage.
- The app loads all loans because this is a small personal ledger. Pagination can be added when the dataset grows.
- Receipt upload remains optional. Production media should go to object storage rather than the API filesystem.
- The API allows cross-origin requests during development. Production should use an explicit origin allowlist.

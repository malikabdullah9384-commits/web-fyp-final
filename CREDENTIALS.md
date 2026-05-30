# Test Accounts

## How to get these working
1. Set up MongoDB Atlas (free) → get your connection string
2. Paste it in `backend/.env` as `MONGO_URI=...`
3. Run: `cd backend && node seed.js`
4. Run backend: `cd backend && npm run dev`
5. Run frontend: `cd frontend && npm start`

---

## Login Credentials

### Admin
| Field    | Value               |
|----------|---------------------|
| Email    | admin@fui.edu.pk    |
| Password | Admin@123           |
| Access   | Full admin panel    |

---

### Supervisors

| Name          | Email             | Password   | Field                  |
|---------------|-------------------|------------|------------------------|
| Sir Asad Javed | asad@fui.edu.pk   | Asad@123   | Information Technology |
| Mam Saima Khan | saima@fui.edu.pk  | Saima@123  | Artificial Intelligence |

---

### Students

| Name                    | Email                | Password       | Roll No | Supervisor     |
|-------------------------|----------------------|----------------|---------|----------------|
| Muhammad Abdullah Malik | abdullah@fui.edu.pk  | Abdullah@123   | 025     | Sir Asad Javed |
| Mahnoor Shah            | mahnoor@fui.edu.pk   | Mahnoor@123    | 021     | Mam Saima Khan |
| Humera Mumtaz           | humera@fui.edu.pk    | Humera@123     | 014     | Sir Asad Javed |

---

## Why Login Fails

| Error shown               | Cause                                           | Fix                              |
|---------------------------|-------------------------------------------------|----------------------------------|
| "Login failed"            | Backend not running or not reachable            | Run `npm run dev` in backend/    |
| "Server error"            | MongoDB not connected (wrong MONGO_URI in .env) | Update MONGO_URI to Atlas string |
| "Invalid credentials"     | Seed not run — no users in database             | Run `node seed.js` in backend/   |
| "No supervisor assigned"  | Student has no supervisor yet                   | Admin must assign one            |

# GridGuide AI — Smart Learning Platform for Power System & SCADA Interns

GridGuide AI is a premium, high-performance web application designed for power system operators, electrical engineers, and interns at major load dispatch centres (like PGCIL, RLDCs, and state SLDCs). The platform blends structured domain training (from power system fundamentals to wide-area monitoring) with AI-grounded tutoring, an equipment terminal database, and field work logs.

---

## ⚡ Tech Stack

*   **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React + SSR + Server Functions) powered by **Vite** and **Vinxi**.
*   **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) for migrations and query compiling.
*   **Database**: [Turso (libSQL)](https://turso.tech/) Cloud SQLite for stateless serverless hosting.
*   **AI Engine**: [Groq Cloud API](https://groq.com/) executing **Llama-3.3-70b-versatile** for ultra-fast, sub-second responses.
*   **Styling**: **Tailwind CSS v4** customized with a premium cyber-grid glassmorphism design system.
*   **Package Manager**: [Bun](https://bun.sh/) (or NPM).

---

## 🛠️ Core Features

1.  **Dynamic Learning Path**: A structured 10-module study roadmap covering:
    *   Power System Fundamentals & Grid Operators
    *   State/Regional Load Dispatch Centres (SLDCs/RLDCs)
    *   SCADA Systems & Architecture
    *   Communication protocols (IEC 60870-5-101/104, DNP3, Modbus)
    *   Energy Management Systems (EMS)
    *   Auxiliary Power Schemes (UPS, DCDB/ACDB)
    *   Substation Automation & Bay Controllers (BCUs, IEC 61850)
    *   Substation Protection (CT/PT, Distance Relays)
    *   WAMS & Phasor Measurement Units (PMUs)
    *   Scheduling, DSM, and Frequency Control
2.  **Interactive AI Tutor**: Inside every lesson, a sidebar chat utilizes **Groq's Llama 3.3** model, grounded dynamically in that specific lesson's markdown content to provide context-aware answers.
3.  **Substation Equipment Database**: Interactive profiles and parameters for hardware like RTU panels, Bay Control Units, Gateway modems, and numeric protection relays.
4.  **Field Work Logbook**: Intern timeline database tracking daily activities, testing telemetry, and loop check logs.
5.  **Downloads Library**: Serves PDF cheat sheets, operator handbooks, and protocol specifications directly from binary BLOBs stored securely in the database (`attachments` table).
6.  **Curriculum Manager (Admin Portal)**: Secure panel permitting admins to update module specifications, create/edit lesson markdown, and configure multiple-choice quizzes dynamically.

---

## 📁 Project Directory Structure

```text
├── src/
│   ├── components/            # Shared UI components (layout, buttons, inputs)
│   │   ├── layout/            # PageShell, SiteLayout, Navbar, Footer
│   │   └── ui/                # Radix UI primitives (Dialog, Select, Progress, etc.)
│   ├── data/                  # Static equipment, module schemas, fallback configs
│   ├── db/
│   │   ├── client.ts          # Turso database connection driver
│   │   ├── schema.ts          # Drizzle tables & relationships compilation
│   │   └── seed.ts            # Default seed rows for initialization
│   ├── hooks/                 # React context hooks (useAuth authentication context)
│   ├── lib/
│   │   ├── auth.ts            # Hashing (scrypt) & secure session encryption
│   │   ├── auth-cookies.server.ts # Server-only HTTP session cookie management
│   │   ├── auth-functions.ts  # Administrative & dynamic server RPC endpoints
│   │   └── utils.ts           # CSS merging helper classes
│   ├── routes/                # TanStack File-Based Routing pages
│   │   ├── index.tsx          # Homepage Dashboard
│   │   ├── auth.tsx           # Login / Registration Gate
│   │   ├── admin.index.tsx    # Admin Console main panel
│   │   ├── admin.modules.tsx  # Dynamic Curriculum Manager
│   │   ├── admin.logs.tsx     # Admin Logbook activity logger
│   │   ├── learning-path.index.tsx # Dynamic modules list
│   │   ├── learning-path.$moduleId.tsx # Grounded lesson workspace & AI chat
│   │   └── api.files.$filename.ts # Dynamic endpoint to download BLOBs
│   ├── router.tsx             # TanStack Router instantiation
│   └── styles.css             # Main styling & glassmorphism theme system
├── drizzle.config.ts          # Drizzle migrations configuration
├── package.json               # Node packages and configuration scripts
└── sqlite.db                  # Local SQLite database fallback
```

---

## 💾 Database Schema

The database compiles the following core tables managed via `src/db/schema.ts`:
*   `users`: ID, name, email, passwordHash, role (`"user"` or `"admin"`).
*   `modules`: Core module settings (index, title, description, accent gradients).
*   `topics`: Individual lessons mapping back to a parent `moduleId`. Contains lesson markdown content.
*   `user_progress`: Maps topics completed by individual users to track progress.
*   `quizzes` & `questions`: Quizzes assigned to modules containing questions, multiple options arrays, and correct index choices.
*   `equipment`: Specifications, interface details, and test logs.
*   `internship_logs`: User logs containing description, screenshots, and metadata.
*   `downloads` & `attachments`: Metadata and binary BLOB content for document sharing.

---

## 🚀 Local Installation & Setup

1.  **Clone & Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**: Create a `.env` file in the root directory:
    ```env
    TURSO_DATABASE_URL="libsql://your-db-url.turso.io"
    TURSO_AUTH_TOKEN="your_turso_auth_token"
    SESSION_SECRET="generate_a_random_long_string"
    GROQ_API_KEY="gsk_your_groq_api_key"
    ```
3.  **Sync Database Schema**: Push migrations directly to Turso:
    ```bash
    npx drizzle-kit push
    ```
4.  **Seed Default Data** (Optional):
    ```bash
    bun run src/db/seed.ts
    # or
    node --import tsx src/db/seed.ts
    ```
5.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    *The app will run locally on [http://localhost:8080](http://localhost:8080).*

---

## ☁️ Production Deployment (Render)

When hosting on **Render** (or any Node.js environment):
1.  **Build Command**:
    ```bash
    npm run build
    ```
2.  **Start Command**:
    ```bash
    node .output/server/index.mjs
    ```
3.  **Environment Variables**: Ensure you configure the following in the Render Dashboard:
    *   `NITRO_PRESET=node-server` (Forces Nitro to compile a running Node.js server instead of a stateless worker).
    *   `TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN` (Turso credentials).
    *   `SESSION_SECRET` (Session signing key).
    *   `GROQ_API_KEY` (Groq API key).

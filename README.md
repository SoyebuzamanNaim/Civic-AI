# Civic Infrastructure AI Platform

An enterprise-grade, privacy-preserving civic issue reporting and management system built for the **AI & API Hackathon 2026**. Powered by Next.js 16 App Router, Supabase Postgres, Google Gemini 2.5 Flash, Groq Llama 3.3, and Cloudinary.

> [!IMPORTANT]
> **Banglish & English NLP Native Support**: Citizens can submit reports in English or natural Banglish (Bengali written in Roman script). The AI pipeline automatically classifies issues, evaluates severity, isolates PII, and identifies duplicate candidate reports.

---

## 📸 Key Capabilities

- 🤖 **Multi-Tier AI Provider Resilience**: Primary analysis via **Google Gemini 2.5 Flash**, failover to **Groq Llama 3.3**, and fallback to a **Deterministic Engine**. Never drops a report.
- 🇧🇩 **Banglish & English Issue Classification**: Processes local Banglish descriptions (e.g. *"Mirpur-10 e rasta bhenge geche, boro gorto"*) into standardized categories, severity scores, and rationale.
- 🗺️ **Explainable Multi-Signal Duplicate Detection**: Combines vector semantic similarity (0.40), geographic distance (0.30), temporal proximity (0.15), and category matching (0.15) to detect duplicate infrastructure reports without suppressing submissions.
- 🔒 **Privacy-First PII Isolation & RLS**: Separates citizen contact data into isolated, non-public tables with strict Supabase Row Level Security (RLS) enforcement.
- 🏛️ **Government Management Portal**: Role-based dispatching, department assignment, progress timeline tracking, and internal note keeping.
- 📸 **Cloudinary Evidence Storage**: Secure multi-format image evidence processing and optimization.

---

## 🏗️ System Architecture

The project strictly follows **Clean Architecture** boundaries and a **Modular Monolith** structure in Next.js 16 App Router.

```mermaid
flowchart TD
    subgraph Client["Client App (Next.js App Router)"]
        CitizenApp["Citizen Reporting & Tracking (/report, /track)"]
        GovPortal["Government Officer Portal (/government)"]
    end

    subgraph CoreEngine["Application & Use Case Layer"]
        SubmitUseCase["SubmitReportUseCase"]
        AiEngine["AI Multi-Tier Provider Engine"]
        DupEngine["Multi-Signal Duplicate Engine"]
        GovUseCase["Government Management Use Cases"]
    end

    subgraph Infrastructure["Infrastructure & Data Layer"]
        Gemini["Google Gemini 2.5 Flash"]
        Groq["Groq Llama 3.3"]
        Cloudinary["Cloudinary Evidence Storage"]
        Supabase[("Supabase Postgres + Vector + RLS")]
    end

    CitizenApp -->|Server Action| SubmitUseCase
    GovPortal -->|SSR Auth Session| GovUseCase

    SubmitUseCase --> AiEngine
    SubmitUseCase --> Cloudinary
    SubmitUseCase --> DupEngine
    SubmitUseCase --> Supabase

    AiEngine -->|Primary| Gemini
    AiEngine -->|Failover| Groq

    GovUseCase -->|Authenticated Query| Supabase
```

*For complete architectural sequence flows and layer breakdowns, see [ARCHITECTURE.md](file:///c:/Users/Naiminator/Codebase/hacka-final/ARCHITECTURE.md).*

---

## 📚 Complete Project Documentation

| Document | Description |
| :--- | :--- |
| 📐 [**ARCHITECTURE.md**](file:///c:/Users/Naiminator/Codebase/hacka-final/ARCHITECTURE.md) | Clean Architecture layer boundaries, dynamic Mermaid sequence diagrams, and failover design. |
| 🔌 [**API.md**](file:///c:/Users/Naiminator/Codebase/hacka-final/API.md) | Endpoint specs, Next.js Server Actions, DTO envelopes, HTTP status codes, and PII protection rules. |
| 🗄️ [**DATABASE_SCHEMA.md**](file:///c:/Users/Naiminator/Codebase/hacka-final/DATABASE_SCHEMA.md) | Supabase Postgres schema, Mermaid ERD, ENUMs, PostGIS/Vector indexes, RPC functions, and RLS policies. |
| 🧪 [**TESTING.md**](file:///c:/Users/Naiminator/Codebase/hacka-final/TESTING.md) | Vitest test execution commands, test coverage breakdown across 18 test modules, and mocking details. |

---

## ⚡ Setup & Installation Guide

Follow these steps to run the Civic Infrastructure Platform locally.

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Git**

---

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/SoyebuzamanNaim/Civic-AI.git
cd hacka-final

# Install npm dependencies
npm install
```

---

### 3. Environment Variables Configuration

Create a `.env.local` file in the project root directory:

```bash
cp .env.example .env.local
```

Fill in the required configuration variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Provider API Keys
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Cloudinary Storage Configuration
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

### 4. Supabase Database & Migration Setup

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new Postgres project.
2. Run the migration scripts located in `supabase/migrations/` via the Supabase CLI or the Supabase SQL Editor in order:
   - `supabase/migrations/20260724000000_initial_schema.sql` (Creates tables, ENUMs, RPC functions, and indexes)
   - `supabase/migrations/20260724000001_security_rls_policies.sql` (Applies Row Level Security policies)
3. *(Optional)* Seed initial department data using `supabase/seed_demo.sql`.

---

### 5. Running the Development Server

Start the Next.js local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Citizen Submission Form**: `http://localhost:3000/report`
- **Public Tracking Portal**: `http://localhost:3000/track`
- **Government Official Login**: `http://localhost:3000/government/login`
- **Government Dashboard**: `http://localhost:3000/government/dashboard`

---

### 6. Running Tests & Type Checks

Run the Vitest test suite and TypeScript static verification:

```bash
# Run all automated tests
npm test

# Run TypeScript type check
npm run check-types
```

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Server Actions, React 19)
- **Database**: Supabase Postgres (`pgvector`, `postgis`, RLS enabled)
- **AI Models**: Google Gemini 2.5 Flash, Groq Llama 3.3 70B Versatile
- **Media Storage**: Cloudinary Image API
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Validation**: Zod Schemas
- **Testing**: Vitest 4

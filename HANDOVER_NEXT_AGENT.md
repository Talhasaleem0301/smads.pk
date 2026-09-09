# Handover & Migration Context Guide for i-Lab Solutions

## 📌 Project Overview
**i-Lab Solutions** is a hybrid **Social Networking and Freelance Hiring Platform** built based on a client proposal document (`PROJECT PROPOSAL: Social Media & Freelance Hiring Platform`).

The platform combines two core modules:
1. **Social Networking**: User profiles, text/image posts, likes, comments, connections, real-time messaging (`/messages`), and notification alerts.
2. **Task-Based Freelance Marketplace**: Job postings (`/post-job`), worker applications, direct hiring, qualification testing with admin verification, wallet management (`/wallet`), and review/ratings (`/reviews`).

---

## 🎯 Architecture Decision & Status
- **Selected Tech Stack**: **React 19 (Vite) + Tailwind CSS + Supabase (PostgreSQL + Supabase Auth + Supabase Storage + Supabase Realtime)**.
- **UI Preservation**: The entire frontend UI/UX, styles, components, and page layouts are preserved **100% intact**.
- **Backend Storage**: All file uploads (payment screenshots, avatars, post attachments) are configured to use **Supabase Storage Buckets** (`avatars`, `payment-proofs`, `post-media`). **No Cloudinary is used.**

---

## 🗄️ Database Setup (`supabase/schema.sql`)

A complete, single-file SQL setup script is located at:
👉 [`supabase/schema.sql`](file:///home/affan/i-lab-solutions/supabase/schema.sql)

### How to Run:
1. Open your **Supabase Project Dashboard**.
2. Navigate to **SQL Editor** -> Click **New Query**.
3. Copy the entire contents of [`supabase/schema.sql`](file:///home/affan/i-lab-solutions/supabase/schema.sql) and paste it into the editor.
4. Click **Run**.

### Key Database Components Included in `schema.sql`:
- **ENUM Types**: `user_role`, `account_status`, `test_status`, `payment_status`, `proof_status`.
- **Tables**: `profiles`, `payments`, `payment_proofs`, `wallets`, `jobs`, `job_applications`, `posts`, `post_likes`, `conversations`, `messages`, `notifications`, `reviews`.
- **Triggers**: `on_auth_user_created` trigger automatically creates a `profiles` and `wallets` entry whenever a new user registers via Supabase Auth.
- **3-Day Inactivity Cron Function**: `check_3_day_inactivity_expiry()` function updates worker accounts from `active` to `expired` if `last_active_at < NOW() - INTERVAL '3 days'` (Section 4.2 of Proposal PDF).
- **Row Level Security (RLS)**: Pre-configured row security policies for workers, employers, and admins.
- **Storage Buckets**: Pre-configures `avatars`, `payment-proofs`, and `post-media` buckets with public access policies.

---

## 🔐 Admin Panel Security & Login Strategy
- **Route**: `/admin`
- **Guard Strategy**: Secured via Role-Based Access Control (RBAC).
- Non-admin users attempting to open `/admin` are intercepted by the route guard and redirected to sign-in.
- Admin authentication checks `profile.role === 'admin'`. In addition, database operations on payment proofs and user approvals are protected by `public.is_admin()` RLS security policies.

---

## 🛠️ Environment Variables Setup
Create a `.env` file in the `frontend` folder with the following variables:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📁 Key Project Files Roadmap

- 📄 [`supabase/schema.sql`](file:///home/affan/i-lab-solutions/supabase/schema.sql): Master SQL database schema and RLS policies.
- 📄 [`frontend/src/lib/api.js`](file:///home/affan/i-lab-solutions/frontend/src/lib/api.js): Centralized API client connecting frontend pages to backend services.
- 📄 [`frontend/src/lib/supabaseClient.js`](file:///home/affan/i-lab-solutions/frontend/src/lib/supabaseClient.js): Supabase JavaScript SDK initialization.
- 📄 [`frontend/src/App.jsx`](file:///home/affan/i-lab-solutions/frontend/src/App.jsx): Master routing table for all 23 application pages.
- 📄 [`frontend/src/pages/Admin.jsx`](file:///home/affan/i-lab-solutions/frontend/src/pages/Admin.jsx): Admin dashboard for proof approval, OTP verification, and user management.
- 📄 [`frontend/src/components/PaymentProofModal.jsx`](file:///home/affan/i-lab-solutions/frontend/src/components/PaymentProofModal.jsx): Screenshot upload modal powering local payments (JazzCash / EasyPaisa / Bank).

---

## ✅ Completed Checklist for Submission
1. [x] Analysis of full project proposal PDF requirements.
2. [x] Architectural decision to migrate data layer to Supabase (PostgreSQL + Storage + Realtime).
3. [x] Creation of production-ready `supabase/schema.sql` covering all 13 database tables and RLS security.
4. [x] Definition of Admin Panel `/admin` route guard & access policy.
5. [x] Integration of Supabase Storage bucket policy (No Cloudinary).
6. [x] Handover document generation (`HANDOVER_NEXT_AGENT.md`).

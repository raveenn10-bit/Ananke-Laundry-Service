# Ananke Laundry Website — Project Chat History & Full Documentation

> **Note**: This file contains the complete record of user prompts, design specifications, business details, authentic Google reviews, technical architecture, and implementation updates for **Ananke Laundry**. You can clone this repository on any machine to view or continue developing this project.

---

## 1. Project & Business Overview

- **Brand Name**: Ananke Laundry
- **Legal Entity**: ANANKE LAUNDRY (PVT) LTD
- **Parent Organization**: Cleanline Linen Management (Pvt) Ltd (Acquired late 2023)
- **Business Type**: Professional Commercial & Guest Laundry / Linen Care Service
- **Tagline**: Professional Laundry & Linen Care in Unawatuna.
- **Physical Address**: No. 195/2, Matara Road, Unawatuna, Galle, Sri Lanka (Google Plus Code: `268X+XPP, Unawatuna`)
- **Telephone / Click-to-Call**: 091 225 0777 (International: +94 91 225 0777)
- **WhatsApp Policy**: Strictly disabled across the entire website because `091 225 0777` is a fixed landline number.
- **Email**: chinthaka.ananke@gmail.com
- **Verified Google Maps Link**: [https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic](https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic)
- **GitHub Repository**: [https://github.com/raveenn10-bit/Ananke-Laundry-Service.git](https://github.com/raveenn10-bit/Ananke-Laundry-Service.git)
- **Vercel Account / Team**: Harsh Apex (`chamiccg@gmail.com` / `chamiccg-9382`)

---

## 2. Operating Hours & Timezone

- **Monday**: 9:00 AM – 5:00 PM
- **Tuesday – Friday**: 9:00 AM – 6:00 PM
- **Saturday – Sunday**: 9:00 AM – 5:00 PM
- **Public Holidays**: Opening hours may vary; customers advised to call ahead.
- **Dynamic Clock**: Automatic live store status ("Open Now" / "Opens at...") computed in real-time using Sri Lanka Standard Time (`Asia/Colombo`, UTC+5:30).

---

## 3. Design Language & Brand Colors

- **Visual Direction**: Premium, cinematic, luxury hospitality & spa aesthetic. Soft glassmorphic cards, natural typography, subtle floating micro-animations.
- **Primary Dark Green**: `#173521`
- **Secondary Green**: `#365B2C`
- **Olive Green**: `#688E3A`
- **Accent Green**: `#9BC53D`
- **Cream / Off-White**: `#F5F1E8`
- **Dark Text**: `#132018`
- **Typography**: Playfair Display (Serif headings) + Inter (Sans-serif body)

---

## 4. Technology Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion (`useInView`, `AnimatePresence`, micro-interactions)
- **Icons**: Lucide React + custom inline SVGs
- **Form Handling**: React Hook Form + Zod Validation
- **Accounting Integration**: Zoho Books API v3 Service Layer (Contacts, Estimates, Invoices)
- **Local Resilience Store**: Atomic file-backed repository (`.data/enquiries.json`) ensuring zero lead loss
- **Deployment**: Vercel (Production) + Git / GitHub (`main` branch)

---

## 5. Complete Section Breakdown & Features

1. **Header & Navigation (`Header.tsx`)**
   - Glassmorphic sticky navbar that darkens on scroll.
   - Desktop nav links & "Request a Quote" CTA button.
   - Mobile full-screen drawer with quick action buttons: Call `091 225 0777` & "Get Directions" (WhatsApp completely removed).

2. **Hero Section (`Hero.tsx`)**
   - High-res luxury background photo (`/images/hero.jpg`) with dark gradient overlay.
   - Verified headline: *"Professional Laundry & Linen Care in Unawatuna"*.
   - 3 CTAs: "Request a Quote", "Call 091 225 0777", "Get Directions".
   - Authentic trust badges (*Commercial Capacity*, *Eco-Responsible Care*, *Southern Province Network*).

3. **Business Information Bar (`InfoBar.tsx`)**
   - Highlights Unawatuna location, landline `091 225 0777`, Cleanline network, and dynamic `Asia/Colombo` live open/closed status.

4. **Services Section (`Services.tsx`)**
   - 7 verified core services:
     1. Professional Washing
     2. Pressing (Ironing & Steam Finishing)
     3. Dry Cleaning (Delicate & Formal Garments)
     4. Stain Removal (Targeted Pre-Treatment)
     5. Linen Care (Bed & Bath Textiles)
     6. Commercial Laundry Solutions (Hospitality Contracts)
     7. Linen Management (Inventory & Rotation Support)
   - Mobile touch-swipe carousel & desktop responsive grid.

5. **Commercial & Hospitality Solutions (`Commercial.tsx`)**
   - Dedicated B2B section for Southern Province hotels, boutique resorts, luxury villas, guest houses, and restaurants.
   - Direct CTA linking to commercial quote form and landline call.

6. **How It Works (`HowItWorks.tsx`)**
   - 4-step verified workflow (*1. Contact Us & Share Requirements*, *2. Textile Assessment*, *3. Professional Processing*, *4. Ready for Collection*).
   - Removed unverified delivery claims until client logistics confirmation.

7. **About Us (`About.tsx`)**
   - Unawatuna facility profile, authentic team photos, and late-2023 Cleanline Linen Management acquisition attribution.

8. **Responsible Laundry Care (`Sustainability.tsx`)**
   - Environmental initiatives: eco-friendly detergent dosing, water reclamation, energy efficiency, and textile longevity under Cleanline standards.

9. **Why Choose Ananke (`WhyChoose.tsx`)**
   - 5 grounded pillars replacing fake numbers: Professional Care, Hospitality Focus, Convenient Unawatuna Location, Commercial Solutions, Industry Network.

10. **Pricing Tiers (`Pricing.tsx`)**
    - Transparent quotation-based tiers replacing fabricated per-piece prices. Focuses on Guest Laundry, Villa Bundles, and Commercial Contracts.

11. **Gallery & Process Lightbox (`Gallery.tsx`)**
    - Real photos of the Unawatuna facility, machines, ironing, and textile processing with filter categories and fullscreen lightbox modal.

12. **Authentic Google Reviews (`Reviews.tsx`)**
    - 8 real customer reviews from Google Maps in Unawatuna/Galle with direct link to Google Maps listing.

13. **FAQ Accordion (`FAQ.tsx`)**
    - Verified answers covering operating hours, commercial contracts, landline communication, and facility drop-off.

14. **Contact & Quote Request Form (`Contact.tsx`)**
    - Dual mode selector: **"Commercial & Hospitality"** (default) vs **"Individual Care"**.
    - Commercial fields: Property Type, Service Required, Linen Categories, Estimated Volume, Service Frequency, Property Address, Contact Person, Phone, Email, Message.
    - Submits directly to backend API `/api/quotes` with honeypot spam protection.
    - Verified confirmation message: *"Thank you. Your laundry requirements have been received. Our team will review your request and contact you regarding a quotation."*

15. **Footer (`Footer.tsx`)**
    - Full verified company details, legal entity name, landline `091 225 0777`, Google Maps directions, hours table with holiday disclaimer, and 2-column mobile layout.

16. **Floating Quick Actions (`FloatingActions.tsx`)**
    - Desktop: Call `091 225 0777`, Google Maps directions, and Quote CTA.
    - Mobile: Sticky bottom bar with "Call 091 225 0777" and "Get Directions".

---

## 6. Zoho Books Integration Architecture

### Core Objectives
Integrate website enquiries and commercial laundry accounts directly with Zoho Books for customer management, quotations, estimates, invoices, and payment tracking without manual data entry.

### Security & Privacy Rules
- **Zero Frontend Credential Exposure**: API secrets, OAuth tokens, and organization IDs are strictly kept in server environment variables.
- **Environment Template (`.env.example`)**:
  ```env
  ZOHO_CLIENT_ID=
  ZOHO_CLIENT_SECRET=
  ZOHO_REFRESH_TOKEN=
  ZOHO_ORGANIZATION_ID=
  ZOHO_DC=com
  ADMIN_SECRET_KEY=
  ```
- **Resilient Fallback**: If Zoho API keys are not yet configured, enquiries are safely staged in `.data/enquiries.json` with status `pending_configuration`. Customers receive the normal confirmation without seeing errors or losing their lead.

### Service Layer (`src/services/zoho/`)
- `auth.ts`: OAuth 2.0 token caching and automatic TTL refresh before expiry.
- `client.ts`: Resilient fetch client with rate-limiting protection (HTTP 429) and safe logging.
- `contacts.ts`: Customer lookup by email & phone to **prevent duplicate customer creation**, plus create and update methods.
- `estimates.ts`: Generates draft Zoho Books Estimates for admin review without fabricating unverified prices.
- `invoices.ts`: Scoped customer invoice retrieval and verified status tracking (`Draft`, `Sent`, `Viewed`, `Partially Paid`, `Paid`, `Overdue`, `Void`).
- `sync.ts`: Full workflow synchronization, error recording, and manual retry.

### Backend API Routes
- `POST /api/quotes`: Public quote submission endpoint.
- `GET /api/admin/zoho/status`: Admin Zoho connectivity check and sync stats.
- `GET /api/admin/quotes`: Admin enquiries listing with status filtering.
- `POST /api/admin/zoho/sync`: Manual sync retry for single enquiries or batch processing.
- `POST /api/admin/zoho/create-estimate`: Admin conversion of an enquiry into a Zoho Estimate.
- `GET /api/portal/invoices`: Customer portal endpoint with strict customer isolation.

### Admin Dashboard (`/admin/zoho`)
Accessible management interface displaying live Zoho Books connection health, sync metrics (Total, Synced, Pending, Failed), an interactive enquiries table with manual sync triggers, and a built-in Setup Guide.

---

## 7. Development Log & User Requests

### Request 1: Initial Goal
> *Create a world-class, luxury, cinematic, modern, mobile-first responsive website for Ananke Laundry in Unawatuna, Sri Lanka.*
- Initialized Next.js 15 App Router codebase with Tailwind CSS v4, Framer Motion, and dark forest green aesthetic.

### Request 2: Local Assets Migration
> *Add local photos from OneDrive to necessary places.*
- Transferred photos into `public/images/` and `public/images/gallery/` across Hero, Services, About, and Gallery.

### Request 3: GitHub Push
> *Push all code updates to GitHub.*
- Initialized git remote `origin` and pushed initial commit to `main` branch.

### Request 4: Authentic Google Reviews
> *Add screenshot reviews to the website.*
- Transcribed all 8 verified Google reviews into `Reviews.tsx`.

### Request 5: Mobile Horizontal Scroll & 2-Column Mobile Footer
> *Make sections scroll horizontally and make footer divided in two in mobile view.*
- Added `overflow-x-auto snap-x snap-mandatory` to key sections and 2-column mobile footer grid.

### Request 6: Add Rich Animations
> *Add more animations and motions.*
- Added floating particles, glassmorphism cards, and smooth scroll entrance animations.

### Request 7: Save Chat History to GitHub
> *GitHub ekata me chat history ekath add karanna mata wena machine ekakin lesiyen access wenna puluwan widiyata.*
- Created initial `CHAT_HISTORY.md` file.

### Request 8: Integrate 100% Real Business Information
> *Replace placeholder text, fake information, generic AI copy, and incorrect contact info with verified Ananke Laundry business details.*
- Implemented verified landline `091 225 0777` (`tel:+94912250777`).
- Completely removed all WhatsApp triggers, floats, and fields.
- Set verified Unawatuna address and Google Maps links.
- Updated opening hours and dynamic Sri Lanka time indicator (`Asia/Colombo`).
- Added 7 verified services, B2B Commercial section, and Cleanline acquisition context.
- Removed fake pricing and fake customer statistics.

### Request 9: Zoho Books Integration Architecture
> *Prepare website to integrate with Zoho Books for accounting, customer management, quotes, invoices, and payments.*
- Built full server-side Zoho Books service architecture.
- Added duplicate customer prevention, quotation pipeline, and invoice status tracking.
- Created resilient local storage and ID mapping (`local_enquiry_id` <-> `zoho_customer_id`).
- Implemented `/admin/zoho` dashboard with sync health and manual retry.
- Enhanced quote form with dual commercial/individual selector.

### Request 10: Fix Vercel Deployment Block
> *Deployment blocked because commit email was not matched / collaborator on Hobby plan.*
- Configured git commit author and committer to `raveenn10-bit <chamiccg@gmail.com>` matching the Vercel project owner account.
- Provided instructions for adding email to GitHub or making the repo public.
- Pushed clean build to `main`.

---

## 8. How to Run & Access from Another Machine

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/raveenn10-bit/Ananke-Laundry-Service.git
   cd Ananke-Laundry-Service
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

*Last Updated: 2026-09-09 — Verified Business & Zoho Books Architecture Release*

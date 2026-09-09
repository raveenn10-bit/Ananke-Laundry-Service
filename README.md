# 🧺 Ananke Laundry — Professional Laundry & Linen Care Website

**Ananke Laundry (Pvt) Ltd** — Unawatuna, Galle, Sri Lanka  
Commercial and individual laundry services connected with **Cleanline Linen Management**.

---

## 🌐 Live Website
> Deployed via Vercel. Connected to: `https://anankelaundry.com`

---

## 🏗️ Tech Stack

| Technology | Usage |
|---|---|
| **Next.js 16 (App Router)** | Multi-page routing, SSG, SSR |
| **TypeScript** | Full type safety |
| **Tailwind CSS** | Responsive utility-first styling |
| **Framer Motion** | Scroll animations, fade-in/out, snap carousels |
| **Zod** | Server-side form validation |
| **Zoho Books API** | Backend B2B accounting & invoicing integration |
| **Lucide React** | Icon library |

---

## 📄 Pages (7 Dedicated Routes)

| Route | Page | Description |
|---|---|---|
| `/` | **Home** | Full landing page — Hero, Services, Commercial Laundry, How It Works, Facility, Reviews, Pricing, FAQ, and Contact |
| `/about` | **About Us** | Company story, Unawatuna facility, Cleanline Linen Management partnership, and sustainability |
| `/services` | **Services** | Professional washing, steam pressing, dry cleaning, stain removal, linen care, and hospitality solutions |
| `/commercial` | **Commercial Laundry** | B2B hospitality linen management for hotels, coastal villas, guest houses, and restaurants |
| `/pricing` | **Pricing & Quotations** | Transparent tiered quotation system for garment care, hospitality linen, and dry cleaning |
| `/gallery` | **Facility Tour** | Filterable photo gallery with full-screen lightbox — team, machines, process, and facility |
| `/contact` | **Contact & Quote** | Phone (`091 225 0777`), Google Maps directions, business hours, and dual-mode quote form |

---

## 📱 Mobile Responsive Design

- **Horizontal Snap Scroll Carousels** on mobile/portrait: Services, Commercial, WhyChoose, Pricing, Sustainability, HowItWorks, Gallery
- **Swipe indicators** with animated hint prompts (`← Swipe left to right →`)
- **Bidirectional scroll fade animations** — elements fade in when entering the viewport and fade out when leaving (`once: false`)
- **Sticky bottom action bar** on mobile with click-to-call (`091 225 0777`) and Google Maps directions
- **Full desktop nav → mobile slide menu** with active page highlighting

---

## 🔌 Zoho Books Integration (Backend)

Securely integrated with **Zoho Books** for B2B accounting and customer management:

- `POST /api/quotes` — Public quote submission (Zod validation, honeypot spam protection)
- `GET /api/admin/zoho/status` — Zoho Books connectivity and organization status
- `POST /api/admin/zoho/sync` — Sync pending enquiries to Zoho Books contacts & estimates
- `POST /api/admin/zoho/create-estimate` — Create draft Zoho Books estimates from enquiries
- `GET /api/admin/quotes` — Admin view of all incoming enquiries
- `GET /api/portal/invoices` — Secure customer-scoped invoice retrieval

> ⚠️ **All Zoho credentials are strictly server-side via environment variables. No secrets are exposed in frontend code.**

---

## ⚙️ Environment Variables (`.env.local`)

```env
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_ORGANIZATION_ID=your_zoho_org_id
ZOHO_DC=com
ADMIN_SECRET_KEY=your_admin_secret
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/raveenn10-bit/Ananke-Laundry-Service.git
cd Ananke-Laundry-Service

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build
npm start
```

---

## 📞 Business Information

| Detail | Info |
|---|---|
| **Business Name** | Ananke Laundry (Pvt) Ltd |
| **Location** | No. 195/2, Matara Road, Unawatuna, Galle, Sri Lanka |
| **Landline** | [091 225 0777](tel:+94912250777) |
| **Google Maps** | [View on Maps](https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic) |
| **Parent Network** | Cleanline Linen Management (Pvt) Ltd |
| **Hours** | Mon 9–5 PM · Tue–Fri 9–6 PM · Sat–Sun 9–5 PM |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── about/page.tsx        # About Us
│   ├── services/page.tsx     # Services
│   ├── commercial/page.tsx   # Commercial Laundry
│   ├── pricing/page.tsx      # Pricing & Quotations
│   ├── gallery/page.tsx      # Facility Tour & Gallery
│   ├── contact/page.tsx      # Contact & Quote
│   ├── sitemap.ts
│   └── api/
│       ├── quotes/           # Public quote submission
│       ├── admin/zoho/       # Admin Zoho Books management
│       └── portal/invoices/  # Customer invoice portal
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── FloatingActions.tsx
│   ├── PageHero.tsx          # Reusable branded page hero
│   └── sections/
│       ├── Hero.tsx
│       ├── Services.tsx
│       ├── Commercial.tsx
│       ├── HowItWorks.tsx
│       ├── About.tsx
│       ├── Sustainability.tsx
│       ├── WhyChoose.tsx
│       ├── Pricing.tsx
│       ├── Gallery.tsx
│       ├── Reviews.tsx
│       ├── FAQ.tsx
│       └── Contact.tsx
└── services/
    └── zoho/                 # Zoho Books API service layer
```

---

*Built for Ananke Laundry (Pvt) Ltd — Unawatuna, Galle, Sri Lanka*

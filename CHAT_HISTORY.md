# Ananke Laundry Website — Project Chat History & Full Documentation

> **Note**: This file contains the complete record of user prompts, design specifications, business details, authentic Google reviews, technical architecture, and implementation updates for **Ananke Laundry**. You can clone this repository on any machine to view or continue developing this project.

---

## 1. Project & Business Overview

- **Brand Name**: Ananke Laundry
- **Business Type**: Professional Laundry & Garment Care Service
- **Tagline**: Freshness in Every Wash.
- **Address**: 195/2, Matara Road, Unawatuna, Sri Lanka
- **Phone / WhatsApp**: +94 74 269 7909
- **Email**: chinthaka.ananke@gmail.com
- **Google Maps Location**: [https://maps.app.goo.gl/7FCjn432AeM9KkXDA?g_st=ic](https://maps.app.goo.gl/7FCjn432AeM9KkXDA?g_st=ic)
- **GitHub Repository**: [https://github.com/raveenn10-bit/Ananke-Laundry-Service.git](https://github.com/raveenn10-bit/Ananke-Laundry-Service.git)

---

## 2. Design Language & Brand Colors

- **Visual Direction**: Premium, cinematic, luxury hospitality & spa vibe. Soft glassmorphic cards, natural typography, subtle floating micro-animations.
- **Primary Dark Green**: `#173521`
- **Secondary Green**: `#365B2C`
- **Olive Green**: `#688E3A`
- **Accent Green**: `#9BC53D`
- **Cream / Off-White**: `#F5F1E8`
- **Dark Text**: `#132018`
- **Typography**: Playfair Display (Serif headings) + Inter (Sans-serif body)

---

## 3. Technology Stack & Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion (`useInView`, `AnimatePresence`, scroll snapping, micro-interactions)
- **Icons**: Lucide React + custom inline SVGs for Facebook & Instagram
- **Form Handling**: React Hook Form + Zod Validation
- **Deployment & Source Control**: Git / GitHub (`main` branch)

---

## 4. Complete Section Breakdown & Features

1. **Header & Navigation (`Header.tsx`)**
   - Glassmorphic sticky navbar that darkens on scroll.
   - Desktop nav links & CTA button ("Book a Pickup").
   - Full-screen animated mobile drawer with quick action buttons (Call Now, WhatsApp).

2. **Hero Section (`Hero.tsx`)**
   - High-res luxury background photo (`/images/hero.jpg`) with dark gradient overlay.
   - Large editorial headline: *"Premium Care for Your Clothes"*.
   - Floating particle effects & trust badges (*Hygienic Process*, *Eco Friendly Products*, *On-Time Service*).

3. **Business Information Bar (`InfoBar.tsx`)**
   - Highlighting location, contact number, email, and opening hours.

4. **Services Section (`Services.tsx`)**
   - 8 services: *Professional Washing*, *Dry Cleaning*, *Ironing*, *Folding & Packing*, *Pickup & Delivery*, *Bedding & Linen*, *Hotel/Villa Laundry*, *Stain Treatment*.
   - Mobile UX: Horizontal touch-swipe carousel (`snap-x snap-mandatory`).
   - Desktop UX: 4-column responsive grid with image hover zoom.

5. **How It Works (`HowItWorks.tsx`)**
   - 4-step interactive flow (*Book Your Pickup*, *We Collect*, *We Clean & Care*, *Fresh Clothes Delivered*).
   - Horizontal swipe on mobile, step indicator glow & connected timeline on desktop.

6. **Why Choose Ananke (`WhyChoose.tsx`)**
   - Dark emerald section displaying 8 core differentiators (*Garment Care*, *Modern Equipment*, *Skilled Team*, *Eco-Conscious*, etc.).
   - Mobile touch-carousel & desktop 4-column grid.

7. **Pricing System (`Pricing.tsx`)**
   - Category filter tabs (*Everyday Laundry*, *Dry Cleaning*, *Ironing*, *Bedding*, *Express Service*, *Commercial*).
   - Indicative price cards with horizontal touch-swipe on mobile and grid layout on desktop.

8. **Pickup & Delivery Booking Flow (`BookingForm.tsx`)**
   - Interactive booking form validated via React Hook Form & Zod.
   - Express toggle, pickup date/time pickers, address field, and instant WhatsApp confirmation link generator.

9. **Authentic Google Reviews (`Reviews.tsx`)**
   - Live 5.0 rating badge with 8 authentic, verified Google reviews from real customers in Galle & Unawatuna.
   - Glassmorphic carousel with navigation buttons, initial avatars, Local Guide tags, and Google Maps link.

10. **Gallery & Process Lightbox (`Gallery.tsx`)**
    - Category filters (*All*, *Team*, *Machines*, *Process*, *Facility*).
    - Masonry grid on desktop & horizontal touch-swipe on mobile, plus fullscreen lightbox modal.

11. **About Us (`About.tsx`)**
    - Brand story (*"Care Beyond Cleaning"*), hygiene commitment, and facility overview photo (`/images/about-facility.jpg`).

12. **Commercial / B2B Laundry (`Commercial.tsx`)**
    - Dedicated B2B inquiry form for hotels, villas, guest houses, and restaurants in Galle/Unawatuna.

13. **FAQ Accordion (`FAQ.tsx`)**
    - Accordion questions handling turnarounds, dry cleaning, delivery zones, and garment care.

14. **Contact & Location (`Contact.tsx`)**
    - Embedded Google Maps location, direct contact form, Call Now button, and WhatsApp integration.

15. **Footer (`Footer.tsx`)**
    - **Mobile View**: Divided into a clean 2-column grid (`grid-cols-2`). *Quick Links* & *Services* side-by-side, with brand logo & newsletter spanning full width.
    - **Desktop View**: 4-column footer with social links & newsletter subscription.

16. **Floating Quick Actions (`FloatingActions.tsx`)**
    - Desktop: Vertical floating bar (Call, WhatsApp, Maps).
    - Mobile: Glowing floating WhatsApp button fixed at bottom-right.

---

## 5. Authentic Google Reviews Data

The website features 8 verified customer reviews extracted from Google Maps:

| Reviewer Name | Badge / Level | Rating | Date | Review Text |
| :--- | :--- | :--- | :--- | :--- |
| **Rukman Lakshika Tennakoon** | Local Guide · 21 reviews | 5.0 ★ | 3 years ago | *"One of the best laundry services in the Galle area. Most of the 5-star hotels and resorts around Galle to Hikkaduwa are the main clients. Recently joined hands with Cleanamatic to give a world-class service to local and foreign customers."* |
| **Sonali Wijesinghe** | Local Guide · 20 reviews | 5.0 ★ | 2 years ago | *"The only place in unawatuna I trust with my laundry"* |
| **Iru Madu** | Local Guide · 102 reviews | 5.0 ★ | 11 months ago | *"Good place. You can wash your clothes fastly . Cheap price"* |
| **Shyam Kawshal** | Local Guide · 54 reviews | 5.0 ★ | 4 years ago | *"Very good laundry on the main road of Unawatuna. Highly recommend it."* |
| **Mark Wijeratne** | Local Guide · 122 reviews | 5.0 ★ | 4 years ago | *"I am very impressed by the out come of my laundry. I highly reccomend!"* |
| **Святой Серафим** | Local Guide · 67 reviews | 5.0 ★ | 2 years ago | *"Very smile people. And clean wear very good))"* |
| **Alina** | 4 reviews | 5.0 ★ | 2 years ago | *"Fast and good. Can recommend for sure"* |
| **Faris Fassey** | Local Guide · 373 reviews | 5.0 ★ | 7 years ago | *"Pleasant welcome recommended.."* |

---

## 6. Development Log & User Requests

### Request 1: Initial Goal
> *Create a world-class, luxury, cinematic, modern, mobile-first responsive website for Ananke Laundry in Unawatuna, Sri Lanka.*

- **Action Taken**: Initialized Next.js 15 App Router codebase with Tailwind CSS v4, Framer Motion, Lucide React, and built 13 dedicated sections with deep forest green brand aesthetic.

### Request 2: Local Assets Migration
> *"C:\Users\chami\OneDrive\Documents\Ananke Laundry\assests\images" add these folders images to necessary places.*

- **Action Taken**: Transferred all local photos into `public/images/` and `public/images/gallery/` and linked them inside `Hero.tsx`, `Services.tsx`, `About.tsx`, and `Gallery.tsx`.

### Request 3: GitHub Push
> *Push all code updates to `https://github.com/raveenn10-bit/Ananke-Laundry-Service.git`.*

- **Action Taken**: Initialized git remote `origin` to target repo and pushed initial commit to `main` branch.

### Request 4: Add Authentic Google Reviews
> *Add screenshot reviews to the website.*

- **Action Taken**: Transcribed all 8 Google reviews from uploaded screenshot images and added them into `Reviews.tsx` with stars, avatars, badges, and smooth carousel navigation.

### Request 5: Mobile Horizontal Scroll & 2-Column Mobile Footer
> *Make these sections scroll horizontal and make footer divided in to two in mobile view.*

- **Action Taken**:
  - Updated `Services.tsx`, `Pricing.tsx`, `Gallery.tsx`, `HowItWorks.tsx`, and `WhyChoose.tsx` to scroll horizontally on mobile devices using `flex overflow-x-auto snap-x snap-mandatory`.
  - Updated `Footer.tsx` to display a 2-column grid (`grid-cols-2`) on mobile.

### Request 6: Add Rich Animations
> *Add more animations and motions to this website (also to the mobile view).*

- **Action Taken**: Added smooth hover animations, tap feedback, floating particle effects, glassmorphism card elevation, and entrance animations across all sections.

### Request 7: Save Chat History to GitHub
> *GitHub ekata me chat history ekath add karanna mata wena machine ekakin lesiyen access wenna puluwan widiyata.*

- **Action Taken**: Created this comprehensive `CHAT_HISTORY.md` file and pushed it to GitHub.

---

## 7. How to Run & Access from Another Machine

To access and run this codebase on any other computer:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/raveenn10-bit/Ananke-Laundry-Service.git
   cd Ananke-Laundry-Service
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

*Last Updated: 2026-09-09*

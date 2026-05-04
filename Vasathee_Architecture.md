# Vasathee Platform Architecture Overview

**Product:** Vasathee Plot Intelligence Platform  
**Target Market:** Plot buyers in Hyderabad’s growth corridors  
**Business Model:** Premium SaaS (Software as a Service)  
**Prepared by:** BSMA Enterprises, Hyderabad, April 2026

---

## 1. Solution Summary

Vasathee is a specialized platform that empowers plot buyers in Hyderabad’s growth corridors with verified listings, legal intelligence, and geospatial insights. The platform’s core value is helping buyers avoid risky purchases and make informed decisions, with a focus on trust, transparency, and actionable data.

---

## 2. Key Features

**MVP (Phase 1) Features:**
- **Plot Search + Map View:** Interactive map-based search with filters for corridor, size, price, and approval status.
- **Legal Status Indicator:** Clear badges for HMDA/DTCP/Gram Panchayat approval on every listing.
- **Growth Corridor Overlay:** Visual layers for infrastructure projects (RRR, Metro, Pharma City) on the map.
- **Verified Listing Badges:** Trust signals based on manual verification of legal and ownership documents.
- **SaaS Buyer Dashboard:** Subscriber-only tools—legal reports, growth scores, document checklists.
- **Site Visit Scheduler:** Integrated scheduling for plot visits.
- **AI Concierge:** Automated FAQ and checklist generator for plot buying.
- **Price Trend Charts:** Historical price data for each corridor.

**Deferred Features (Future Phases):**
- Commute time analysis, 360° walkthroughs, blockchain document anchoring, 3D/AR plot visualization, NRI document vault, and more.

---

## 3. User Tiers & Access

| Tier                | Free (Explorer) | Pro (₹999/mo) | Elite (₹2,499/mo) |
|---------------------|-----------------|---------------|-------------------|
| Map Search          | ✓               | ✓             | ✓                 |
| Legal Reports       | View only       | Full          | Full              |
| AI Concierge        | -               | 5 queries/mo  | Unlimited         |
| Site Visit          | -               | ✓             | ✓                 |
| Saved Searches      | -               | 3             | Unlimited         |
| Comparative Analysis| -               | -             | ✓                 |
| Expert Consultation | -               | -             | ✓                 |
| NRI Vault           | -               | -             | ✓                 |

---

## 4. Technology Stack

**Frontend:**
- **Framework:** Next.js 14 (React-based, for fast, modern web apps)
- **UI Library:** shadcn/ui (for consistent, accessible components)
- **Mapping:** MapLibre (open-source map rendering)
- **PWA:** Mobile-responsive, installable as an app

**Backend:**
- **API:** FastAPI (Python-based, high-performance REST API)
- **Database:** PostGIS (PostgreSQL with geospatial support)
- **Authentication:** Keycloak (enterprise-grade identity management)
- **Cache:** Redis (for fast data access and session management)
- **AI Integration:** Claude API (for chat and FAQ features)
- **Payment:** Razorpay (subscription management and payments)
- **Scheduling:** Cal.com (site visit scheduling)

**Infrastructure:**
- **Cloud:** AWS Mumbai region
- **Containerization:** K3s (lightweight Kubernetes)
- **Storage:** Amazon S3 (for images and documents)
- **CI/CD:** GitHub Actions (automated deployment)
- **Monitoring:** Grafana (infrastructure and app monitoring)
- **Security:** SSL, domain DNS management

---

## 5. Data & Verification

- **Listings:** 300–500 curated, manually verified plots at launch.
- **Verification:** Each listing checked for legal status, location accuracy, and price authenticity.
- **Badges:** “Vasathee Verified”, “Document Pending”, “Buyer Caution” for instant trust signals.

---

## 6. Inventory & Acquisition

- **Builder Partnerships:** HMDA-approved layouts, direct document uploads.
- **Broker Network:** Verified brokers, document-based listing approval.
- **Owner-Direct:** NRI and individual owners, strict verification before listing.

---

## 7. Security & Privacy

- All user data is securely stored and managed.
- Legal documents are only accessible to authorized users.
- Payment and authentication handled by industry-standard providers.

---

## 8. Roadmap & Scalability

- **Phase 1:** Hyderabad growth corridors, focus on plots only.
- **Phase 2+:** Expand features (commute analysis, AR, blockchain), add more asset classes, scale to other cities.

---

## 9. Success Metrics

- Verified listings, active users, free-to-paid conversion, NPS (Net Promoter Score), revenue, and engagement.

---

## 10. Summary Diagram

```
[User]
   |
[Next.js Web App] <--> [MapLibre Maps]
   |
[FastAPI Backend] <--> [PostGIS DB] <--> [Redis Cache]
   |         |             |             |
[Keycloak] [Claude AI] [Razorpay] [Cal.com]
   |
[AWS Cloud Infrastructure (K3s, S3, Grafana)]
```

---

## 11. Contact

For more details, visit [vasathee.com](https://vasathee.com) or contact BSMA Enterprises, Hyderabad.

---

This document provides a clear, non-technical overview of the Vasathee platform’s architecture, features, and technology stack for end users and stakeholders.

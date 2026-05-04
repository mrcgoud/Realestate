# Vasathee Platform Technical Architecture Document

**Product:** Vasathee Plot Intelligence Platform  
**Prepared by:** BSMA Enterprises, Hyderabad, April 2026

---

## 1. Solution Overview
Vasathee is a SaaS platform for plot buyers in Hyderabad, providing verified listings, legal intelligence, and geospatial analytics. The platform is designed for scalability, security, and extensibility, supporting multiple user roles and advanced analytics features.

---

## 2. High-Level Architecture

```
[User (Web/Mobile)]
    |
[Next.js Frontend (React, PWA)]
    |
[API Gateway]
    |
[FastAPI Backend (Python)]
    |         |         |         |         |
[PostGIS DB] [Redis] [Keycloak] [Claude AI] [Razorpay]
    |
[AWS Cloud Infra (K3s, S3, Grafana, CI/CD)]
```

---

## 3. User Roles & Permissions

- **Guest/Explorer:**
  - Browse map and listings
  - View basic legal status
  - Limited access to reports
- **Registered User:**
  - Save searches
  - Schedule site visits
  - Access newsletters
- **Pro Subscriber:**
  - Full legal reports
  - AI Concierge (5 queries/mo)
  - Download intelligence reports
  - Schedule and manage site visits
- **Elite Subscriber:**
  - All Pro features
  - Unlimited AI Concierge
  - Comparative analysis tools
  - NRI document vault
  - Expert consultation
- **Admin:**
  - Manage listings, users, and partners
  - Approve/verify documents
  - Access analytics dashboard
- **Builder/Broker Partner:**
  - Submit and manage listings
  - Upload legal documents
  - Track listing performance

---

## 4. Features (Detailed)

### 4.1 Listings & Search
- Advanced map-based search (MapLibre)
- Filters: corridor, price, size, approval status
- Growth corridor overlays (infrastructure, metro, RRR)
- Verified badges and trust signals

### 4.2 Legal Intelligence
- Legal status indicator (HMDA/DTCP/Gram Panchayat)
- Downloadable legal reports (PDF)
- Document checklist and upload
- Admin verification workflow

### 4.3 Analytics & Insights
- Price trend charts (corridor-wise)
- Growth score for each plot
- Comparative analysis (Elite only)
- Engagement and conversion analytics (admin)

### 4.4 AI Concierge
- FAQ and checklist generator (Claude API)
- Contextual chat for plot buying queries
- Usage limits by tier

### 4.5 Scheduling & Communication
- Site visit scheduler (Cal.com integration)
- Automated reminders and confirmations
- In-app messaging (future phase)

### 4.6 User Management
- Keycloak-based authentication (OAuth2, SSO)
- Role-based access control
- Subscription management (Razorpay)

### 4.7 Inventory Acquisition
- Builder/broker onboarding
- Document upload and verification
- Owner-direct listing with strict KYC

### 4.8 Security & Compliance
- SSL/TLS for all endpoints
- Encrypted storage (S3 for docs)
- Audit logs (admin actions)
- GDPR-compliant user data handling

---

## 5. Technology Stack (Detailed)

### Frontend
- **Framework:** Next.js 14 (React)
- **UI:** shadcn/ui, Tailwind CSS
- **Mapping:** MapLibre GL JS
- **State Management:** Zustand/Redux (as needed)
- **PWA:** Service Workers, mobile-first design
- **Testing:** Jest, React Testing Library

### Backend
- **API:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15 + PostGIS
- **Cache:** Redis (session, query cache)
- **Auth:** Keycloak (OpenID Connect, SSO)
- **AI:** Claude API (via backend integration)
- **Payments:** Razorpay REST API
- **Scheduling:** Cal.com API
- **Background Jobs:** Celery (for async tasks)
- **Testing:** Pytest, coverage

### Infrastructure
- **Cloud:** AWS (Mumbai)
- **Containerization:** Docker, K3s (Kubernetes)
- **Storage:** Amazon S3 (images, docs)
- **CI/CD:** GitHub Actions
- **Monitoring:** Grafana, Prometheus
- **Logging:** ELK stack (future phase)
- **Domain/DNS:** Route53

---

## 6. End-to-End User Journey

1. **Discovery:** User lands on Vasathee, browses map and listings.
2. **Registration:** User signs up (email/OAuth2 via Keycloak).
3. **Exploration:** User applies filters, views plot details, overlays.
4. **Upgrade:** User subscribes to Pro/Elite (Razorpay payment flow).
5. **Intelligence:** User accesses legal reports, AI Concierge, price trends.
6. **Site Visit:** User schedules a visit (Cal.com integration).
7. **Decision:** User downloads reports, consults experts (Elite).
8. **Admin/Partner:** Admins and partners manage listings, verify docs, and monitor analytics.

---

## 7. Security & Compliance
- All endpoints secured with SSL
- Role-based access enforced at API and UI
- Sensitive docs stored encrypted (S3)
- Audit logs for all admin actions
- GDPR and Indian IT Act compliance

---

## 8. Roadmap & Scalability
- **Phase 1:** Hyderabad corridors, core features
- **Phase 2:** Commute analysis, AR/3D, blockchain anchoring
- **Phase 3:** Multi-city, multi-asset expansion
- **Scalability:** Microservices-ready, K8s-native, stateless API

---

## 9. Diagram (Technical)

```
[User (Web/PWA)]
   |
[Next.js (SSR/CSR)]
   |
[API Gateway]
   |
[FastAPI (REST)]
   |      |      |      |      |      |
[PostGIS][Redis][Keycloak][Claude][Razorpay][Cal.com]
   |
[AWS Infra: K3s, S3, Grafana, Prometheus, Route53]
```

---

## 10. Contact & References
- Product: https://vasathee.com
- Docs: Internal Confluence, GitHub
- Support: BSMA Enterprises, Hyderabad

---

*This document is intended for technical teams and product managers. For questions, contact the Vasathee engineering team.*

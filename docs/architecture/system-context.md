# System Context Architecture

## 1. Executive Overview

The Global Tourism Platform is a distributed digital platform serving the end-to-end travel lifecycle: discovery, reservation, payment processing, operational dispatch, itinerary management, customer support, and regulatory reporting.

This document defines the system context, human actors, external system integrations, trust boundaries, and evolutionary milestones.

---

## 2. Actors & Stakeholders

| Stakeholder                     | Role & Responsibility                                                                 | Interface Channel                                          |
| :------------------------------ | :------------------------------------------------------------------------------------ | :--------------------------------------------------------- |
| **Travellers**                  | Search catalog, book services, view itineraries, submit reviews, and request support. | Web App (Next.js) / Mobile Companion (Future React Native) |
| **Tourism Suppliers**           | Manage inventory, pricing, availability calendars, and operational manifests.         | Web Portal (Next.js)                                       |
| **Guides & Drivers**            | Receive real-time dispatch, verify passenger manifests, report status updates.        | Mobile Operational App (Future React Native)               |
| **Platform Administrators**     | System governance, category taxonomy, fee structures, supplier onboarding approval.   | Admin Dashboard (Next.js)                                  |
| **Customer Support Operations** | Handle dispute resolution, reservation alterations, incident escalations.             | Support Console (Next.js)                                  |
| **Tourism Authorities**         | Inspect licensing, audit regulatory compliance, monitor tax reporting metrics.        | Regulatory Audit Portal                                    |

---

## 3. System Components: Current Baseline vs. Future Roadmap

### A. Current Phase 1 Implementation (Operational)

- **Monorepo Baseline**: Turborepo, pnpm workspaces, and strict TypeScript.
- **Web Application Baseline (`apps/web`)**: Next.js App Router providing initial user shell and SEO structure.
- **Contracts (`packages/contracts`)**: Pure domain models, actor definitions, and provider-neutral adapter interfaces.
- **Validation (`packages/validation`)**: Strict runtime type assertions and schema validators.
- **Configuration (`packages/config`)**: Application-independent environment resolution and feature toggles.
- **UI System (`packages/ui`)**: Domain-free, accessible design system components.
- **Architecture Enforcement (`scripts/`)**: Automated DAG and boundary validation.

### B. Future Intended Components (Planned Sprints)

- **Transactional Core (ASP.NET Core / C#)**:
  - High-throughput ACID booking engine.
  - Payment settlement, cancellation, and refund state machines.
  - Double-entry ledger for supplier payouts.
- **Intelligence Services (Python / FastAPI)**:
  - Vector search and semantic recommendations using `pgvector`.
  - Geospatial route and tour optimization using PostGIS.
  - AI-assisted itinerary synthesis and dynamic pricing suggestions.
- **Data & Storage Tier**:
  - **PostgreSQL 16+**: Relational persistence for accounts, transactions, and bookings.
  - **PostGIS**: Spatial indexing for geographic queries, proximity, and regional routing.
  - **pgvector**: Embeddings storage for multimodal search and AI matching.
  - **Redis 7+**: Distributed session caching, real-time rate limiting, and pub/sub.
  - **S3-Compatible Object Storage**: Media assets (photos, documents, guide verifications).
- **Mobile Client (React Native)**:
  - Guide and driver dispatch application with GPS location streaming.
  - Offline-first traveller mobile wallet and ticket passholder.

---

## 4. External System Integrations (Provider-Neutral Adapters)

All third-party services are encapsulated behind provider-neutral interfaces in `@tourism/contracts`:

1. **Payment Gateways (`IPaymentProviderAdapter`)**:
   - Handles credit card processing, local mobile money (e.g., M-Pesa, MTN Mobile Money), and payouts.
   - External systems: Stripe, Adyen, Flutterwave.
2. **Mapping & Geocoding (`IMappingProviderAdapter`)**:
   - Map rendering, forward/reverse geocoding, and route calculation.
   - External systems: Mapbox, Google Maps Platform, OpenStreetMap.
3. **Notification Services (`INotificationAdapter`)**:
   - Transactional email, SMS dispatch, and push notifications.
   - External systems: SendGrid, Resend, Twilio, AWS SES.

---

## 5. Trust Boundaries & Security Zones

```text
+--------------------------------------------------------------------------------+
| ZONE 1: PUBLIC / UNTRUSTED (Browsers, Mobile Clients, External Webhooks)       |
|   - Travellers, Suppliers, Anonymous Browsing, Public Ingress                  |
+--------------------------------------------------------------------------------+
                                       |
                       TLS 1.3 / Strict Content-Security-Policy
                                       v
+--------------------------------------------------------------------------------+
| ZONE 2: EDGE / DMZ (Reverse Proxy, Next.js Web App, CDN)                       |
|   - Request Authentication & Session Verification                              |
|   - Input Sanitization & Runtime Schema Validation (@tourism/validation)       |
+--------------------------------------------------------------------------------+
                                       |
                  mTLS / Private Subnet / Bearer Token Auth
                                       v
+--------------------------------------------------------------------------------+
| ZONE 3: APPLICATION SERVICES (Internal Microservices & Engines)                 |
|   - Future ASP.NET Core Transactional Engine                                   |
|   - Future Python FastAPI Intelligence Engine                                  |
+--------------------------------------------------------------------------------+
                                       |
                   Encrypted At Rest & In Transit / Network Isolation
                                       v
+--------------------------------------------------------------------------------+
| ZONE 4: DATA PERSISTENCE TIER (Restricted Access)                               |
|   - PostgreSQL (Relational, PostGIS, pgvector)                                 |
|   - Redis Cluster                                                              |
|   - Object Storage (S3-compatible)                                             |
+--------------------------------------------------------------------------------+
```

---

## 6. Sensitive Data Flows

1. **Payment Credentials**:
   - Travellers submit payment details directly to payment provider tokenization elements (PCI-DSS Scope Reduction).
   - Platform backend only handles tokenized payment references and provider transaction IDs.
2. **Personally Identifiable Information (PII)**:
   - Passports, phone numbers, and driver license verifications are encrypted at rest with AES-256 and restricted to authorized support roles.
3. **Audit Trail**:
   - All booking status transitions, financial disbursements, and administrative overrides generate immutable audit records.

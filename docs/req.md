# Tour Guide and Adventure Safari Management System
### Market research, gap analysis and development specification

> Prepared 7 November 2026. Market facts come from public vendor pages, review sites (Capterra, GetApp, G2, FitGap) and operator or park-authority pages. Items marked **[Inference]** are my analysis, not a sourced fact. Items marked **[Verify]** change often and must be confirmed with the official source before you build on them.

---

## 1. Executive summary

- The market splits into **five product families**, and no single product covers a safari or adventure operator end to end: itinerary builders, back-office tour ERPs, booking and activity platforms, lodge/supplier reservation systems, and general fleet tools.
- The **biggest gap** is the link between *selling* a trip and *running* it: guide, driver and vehicle allocation, park permits, crew welfare, live safety, field apps and cost control per departure.
- Safari-specific tools are strong in Southern Africa and are built around international sellers. **East Africa, and Tanzania in particular, is under-served** on park-fee compliance, mobile money, offline field use and mountain/trek crew operations.
- **Recommended product:** one platform with a sales side (quotes, itineraries, booking, payments), an operations side (resources, permits, dispatch, safety), a field app for guides, and a client portal. Build it as a **modular monolith** on your existing stack, and ship an MVP that proves the booking-to-dispatch loop first.

---

## 2. Market landscape

### 2.1 Product families and examples

| Family | Examples found | Primary job |
|---|---|---|
| Itinerary and proposal builders | Wetu, Safari Portal, Tourwriter | Build branded multi-day itineraries and client proposals fast |
| Back-office tour operator ERP | Tourplan, GranIT Safari Software (Windows, Africa-focused), TourSys, TourTools, Softrip, Nitro | Quotes, costing, supplier contracts, reservations, accounts |
| Booking and activity platforms | Bókun, Rezdy, Peek Pro, FareHarbor, TourCMS, TrekkSoft, Checkfront, Zaui, WeTravel | Online booking, availability, payments, channel distribution |
| Lodge and supplier reservation systems | ResRequest, NightsBridge | Supplier-side inventory that operators book into |
| Fleet and maintenance tools | Fleetio, Simply Fleet | Vehicle maintenance, inspections, fuel and expense logs |

Capterra and G2 each list well over a hundred tour-operator products, so the category is crowded. Crowded does not mean complete, as section 4 shows.

### 2.2 What the leading safari-specific products do

- **Wetu:** a visual itinerary builder that produces branded proposals with maps, images and day-by-day detail, a shared supplier content network strongest in African safari destinations, client itinerary apps (online and offline), itinerary view analytics, supplier rating and flagging, and an API. It integrates with Tourplan, ResRequest, NightsBridge, Lemax, Travelogic, Umapped and Smartbox. It handles mobile safaris with day stops and overnight camps.
- **GranIT Safari Software:** specialist Windows-based, multi-user, multi-site software for the African travel industry. It integrates with ResRequest. One operator reports response times as low as 10 minutes. Public review volume is very low, so treat it as a legacy-style desktop system.
- **Tourplan:** a long-established full ERP for inbound operators and DMCs, with accounts and management reporting. Pricing is by quote.
- **Safari Portal:** a premium itinerary builder (listed as trending on G2).
- **Zaui:** a general tour platform with a wildlife and eco-tour offering: scheduling, guide and vehicle assignment with conflict checks, digital manifests pushed to a driver app, and a channel manager.

---

## 3. What these systems comprise (feature baseline)

Treat this as the **table-stakes list** your product must match or exceed.

### 3.1 Sales and planning
- Itinerary builder with day-by-day structure, maps, images and branded PDF/online output
- Quotes and cost estimates by itinerary, duration and group size (G2 requires this for the category)
- Package and template library
- Supplier and content database (lodges, camps, activities, transfers)
- CRM: lead capture, customer records, notes, follow-ups
- Proposal analytics (views, time spent)

### 3.2 Booking and payments
- Online reservation engine and availability calendar
- Reservation management across accommodation, activities and transport
- Agent and reseller portals; channel manager (OTA sync)
- Payment collection, deposits and balances, invoices

### 3.3 Back office
- Supplier and vendor management, contracts and rates (including seasonal rates)
- Accounts and management reporting, margin and cost tracking
- Document management (vouchers, itineraries, manifests)
- Multi-language, multi-currency, customizable branding, API access

### 3.4 Operations
- Resource allocation: guides, drivers, vehicles, with double-booking checks
- Digital manifests and driver mobile apps (in some platforms)
- Fleet maintenance, inspections, fuel and expense logs (separate fleet tools)
- Client apps with offline itineraries

### 3.5 Adventure and trek operations (seen mostly in operator practice, not in software)
- Daily risk assessments and evacuation procedures per trek section
- Emergency oxygen, oximeter and medical check logs
- GPS or satellite tracking of climbing teams
- Porter welfare programs (KPAP-style): load limits, wages, monitoring

---

## 4. What they lack (gap analysis)

Each gap lists the evidence and the product opportunity.

### G1. Selling and running a trip live in different tools
- **Evidence:** Wetu is described as prioritizing trip design and presentation over high-volume transactional booking, and lists limited transactional booking as a drawback. Booking platforms, in turn, suit single-activity or day tours; one reviewer of a booking tool called it not suitable for multi-day operators.
- **Opportunity:** a single data model where an accepted quote becomes a booking, then a departure with assigned resources, then an operational manifest, with no re-keying.

### G2. Field operations are an afterthought
- **Evidence:** Driver apps and fleet scheduling appear mainly in general tour/transport platforms. Safari operators such as Basecamp Explorer use a separate fleet tool (Simply Fleet) to log driver expenses, fill-ups and vehicle inspections, which implies the sales system does not cover this.
- **Opportunity:** an offline-first guide and driver app with manifest, route, vehicle inspection, expense capture, incident reporting and client check-in, synced to the back office.

### G3. Legacy interfaces, heavy implementation and cost
- **Evidence:** Reviews describe a dated interface in one major booking system, and a tour consultant picked a lower-cost system because Tourplan and Tourwriter were seen as expensive with implementation measured in months and sometimes extra fees. GranIT is a Windows desktop product.
- **Opportunity:** a modern web-first product with self-serve onboarding, rate and supplier import from spreadsheets, and a pricing tier that small and mid-size local operators can afford.

### G4. Thin reporting
- **Evidence:** A Zaui reviewer said advanced reporting is hard to find and scheduled/emailed reports do not exist; discounts were limited to fixed amounts.
- **Opportunity:** built-in margin-per-departure, utilization (guides, vehicles), conversion funnel, supplier spend and cash-flow reports, plus scheduled email delivery.

### G5. Regulatory and park-authority workflows are not first-class
- **Evidence (Tanzania):** Park payments are cashless and use a government e-payment control number; from 1 July 2025 licensed operators must enter each visitor's name, passport number, nationality, age and gender (exactly as on the passport) into the TANAPA reservation and payment system at the time of payment. Ngorongoro is administered separately from TANAPA, and fees carry 18% VAT. Park-fee rules and rates are under periodic review. **[Verify]**
- **Evidence (global tools):** none of the generic product pages I reviewed mention park-authority control numbers or passport-data submission. **[Inference: absence of evidence, not proof.]**
- **Opportunity:** a Permits module that stores passenger passport data once, generates the park-fee breakdown per person/vehicle/night, tracks control numbers and payment status, and exports data in the format the park portal expects.

### G6. Local payments and cash-flow realities
- **Evidence:** A Tanzania-first marketplace concept names limited access to reliable payment gateways, FX volatility, delayed payouts, fraud and chargebacks, and the need for mobile-money flows. Exim Bank has a tour-operator account and TANAPA card for park fees.
- **Opportunity:** multi-currency quoting (USD/TZS), mobile money and bank collection, supplier payment scheduling, and an exchange-rate lock per booking. **[Verify which payment providers you will integrate.]**

### G7. Safety, risk and crew welfare are paper-based
- **Evidence:** Operators describe per-day risk assessments, evacuation plans per trek section, twice-daily medical checks "written in a book", emergency oxygen, and GPS devices. KPAP-partner operators carry a monitoring porter on each trek, and load limits (for example 25 kg per porter) are a published standard. One large operator built its own automated expedition-preparedness system and its own itinerary software, which signals a market gap.
- **Opportunity:** a Safety and Crew module: pre-departure readiness checklist (gear, oxygen, first-aid, crew certifications), daily health logs, load/wage records per porter, incident and evacuation workflow, live location sharing.

### G8. Guide and crew as a managed workforce
- **Evidence:** Guide and vehicle profiles with allocation validation exist in only some DMC tools. Guides' certifications (for example Wilderness First Responder), license validity and language skills are central to sales and compliance.
- **Opportunity:** a Staff and Guide module with certifications and expiry alerts, availability, skills and languages, ratings from clients, pay and tips, and a conflict-checked roster.

### G9. Local-market distribution
- **Evidence:** The Tanzania-first concept notes local operators lose demand and margin to global OTAs, and that many local sites lack structured itineraries, SEO and online checkout.
- **Opportunity:** a built-in public booking site and widget (this ties directly to your Sanifu Labs web work), with structured itineraries and transparent park-fee breakdowns.

---

## 5. Product definition

**Working name:** *(your choice)*
**Positioning:** the operating system for safari and adventure operators: sell, dispatch, run safely and get paid in one place.

### 5.1 Personas
| Persona | Needs |
|---|---|
| Owner / operations manager | Margins, utilization, compliance, cash flow |
| Sales / reservations consultant | Fast quotes and itineraries, availability, follow-up |
| Operations coordinator | Allocate guides/vehicles, permits, manifests, issue handling |
| Guide / driver | Offline manifest, route, check-in, expenses, incident reports |
| Accountant | Invoices, supplier payables, VAT, reconciliation |
| Client (traveler or agent) | Quote review, payment, documents, live trip info |
| Supplier (lodge/camp) | Receive requests, confirm availability and rates |

### 5.2 Modules
| ID | Module | Summary |
|---|---|---|
| M1 | Catalog | Products, itineraries, templates, seasonal rates, supplier content |
| M2 | CRM and leads | Lead capture, pipeline, communications log |
| M3 | Quotes and itineraries | Costing engine, branded proposal, versioning, acceptance |
| M4 | Booking and payments | Deposit/balance, invoices, multi-currency, mobile money and card |
| M5 | Suppliers | Contracts, rates, requests/confirmations, payables |
| M6 | Resources | Guides, drivers, vehicles, camping gear; availability and conflict detection |
| M7 | Permits and park fees | Passenger passport data, fee calculation, control numbers, status |
| M8 | Dispatch and manifests | Departure board, assignments, digital manifest |
| M9 | Field app | Offline-first guide/driver app: check-in, inspections, expenses, incidents |
| M10 | Safety and crew welfare | Readiness checklist, health logs, load limits, evacuation workflow, live location |
| M11 | Fleet maintenance | Service schedules, inspections, fuel, costs |
| M12 | Client portal | Quote, payment, documents, live itinerary, feedback |
| M13 | Reporting | Margin per departure, utilization, funnel, supplier spend, scheduled emails |
| M14 | Admin and integrations | Roles, audit log, API/webhooks, notifications (email, SMS, WhatsApp) |

---

## 6. Core workflows

1. **Lead to quote:** capture lead, pick template, adjust days/suppliers, system computes cost and margin per person and per vehicle, send branded proposal.
2. **Quote to booking:** client accepts, deposit is collected, supplier requests are sent, inventory is held.
3. **Booking to departure:** travelers' passport data collected, park fees computed and paid, guide/vehicle assigned with conflict checks, manifest generated.
4. **Run the trip:** guide opens the manifest offline, completes vehicle inspection, checks in clients, logs expenses and incidents, shares location.
5. **Close out:** expenses reconciled against budget, supplier payables approved, client feedback collected, margin report finalized.
6. **Adventure variant (trek):** add crew roster with roles and loads, daily health log, readiness checklist before departure, evacuation workflow on alert.

---

## 7. Domain model (initial entities)

```
Organization ─┬─ User ── Role
              ├─ Customer ── Lead
              ├─ Supplier ── Property ── RoomType ── Rate (season, currency)
              ├─ Product (Tour/Trek) ── ItineraryTemplate ── ItineraryDay ── ServiceLine
              ├─ Quote ── QuoteVersion ── QuoteLine
              ├─ Booking ── Traveler (passport data) ── Payment ── Invoice
              ├─ Departure ── Assignment (Guide | Driver | Vehicle) ── Manifest
              ├─ Staff (Guide | Driver | Porter | Cook) ── Certification ── Availability
              ├─ Vehicle ── Inspection ── MaintenanceTask ── FuelLog
              ├─ ParkPermit ── ParkFeeLine ── ControlNumber
              ├─ SafetyChecklist ── HealthLog ── Incident ── LoadRecord
              └─ AuditLog
```

Rules of thumb: store money as integer minor units with an ISO currency code; store the FX rate on the booking; make every availability check a database-level constraint, not only a service check; keep PII (passport data) encrypted at rest and access-logged.

---

## 8. Technical architecture

Aligned with your stack (Next.js, NestJS, PostgreSQL, Redis, TypeORM, Flutter).

### 8.1 Style
**Modular monolith** first. One deployable NestJS app, one module per bounded context (M1–M14), strict dependency direction, and the option to extract services later (for example notifications or reporting).

### 8.2 Layering and separation (per module)
```
src/modules/<feature>/
  api/            controllers, DTOs (class-validator), request/response mappers
  application/    use-cases / services (orchestration, transactions)
  domain/         entities, value objects, domain services, domain events, policies
  infrastructure/ TypeORM repositories, external clients (payments, SMS), queues
  <feature>.module.ts
```
- Controllers contain no business logic; services never touch HTTP types; the domain layer has no framework imports.
- Repositories sit behind interfaces so the domain and use-cases are unit-testable without a database.
- Cross-module calls go through exported application services or domain events, never through another module's repositories.
- DTOs and entities are separate; never return entities directly from controllers.

### 8.3 Platform components
| Concern | Choice |
|---|---|
| Web (staff and public site) | Next.js, TypeScript, shared design tokens |
| Field app | Flutter with local database (SQLite/Drift) and a sync queue for offline-first |
| API | NestJS REST with OpenAPI; GraphQL only if a real need appears |
| Database | PostgreSQL; migrations only (no schema sync in production); exclusion constraints for resource double-booking |
| Cache / queues | Redis; BullMQ for emails, SMS, PDF generation, report schedules |
| Files | S3-compatible object storage; signed URLs |
| Auth | JWT with refresh rotation, RBAC plus per-organization scoping (multi-tenant) |
| Notifications | Email, SMS, WhatsApp provider behind an interface |
| PDF / proposals | Server-side render from the same template as the web proposal |
| Observability | Structured logs, health checks, error tracking, audit log |

### 8.4 Offline-first field app (critical)
- Download the manifest, itinerary, contacts and checklists before departure.
- All writes go to a local outbox with idempotency keys; sync when connectivity returns.
- Conflict policy: server wins for assignments, last-write-wins with timestamps for field notes, append-only for incidents and health logs.

### 8.5 Multi-tenancy
Single database, `organization_id` on every tenant table, enforced in a repository base class and with PostgreSQL row-level security as a second line of defense.

### 8.6 Security and privacy
Encrypt passport data and payment references; role-based field visibility; full audit trail of reads on sensitive records; data-retention policy per document type; GDPR-style export/delete requests because many clients are international.

### 8.7 Engineering standards
- TypeScript strict mode; ESLint and Prettier enforced in CI
- Conventional commits; trunk-based development with short-lived branches
- Test pyramid: unit tests for domain and use-cases, integration tests against a real Postgres container, a small set of end-to-end flows
- Contract tests between the API and the Flutter app via the OpenAPI schema
- Architecture tests that fail the build when a module breaks the dependency rules

---

## 9. Roadmap

### Phase 0: Discovery and foundations (2 weeks)
Interview 5–8 operators (safari, Kilimanjaro, day-trip). Collect their spreadsheets, rate sheets and manifests. Confirm park-portal data requirements. Set up the repo, CI, auth, tenancy, and design system.

### Phase 1: MVP, "sell and dispatch" (8–10 weeks)
M1 Catalog, M2 CRM, M3 Quotes/itineraries, M4 Booking and deposits, M6 Resources, M8 Dispatch and manifests, basic M13 reports. Output: a quote becomes a booking becomes an assigned departure with a printable manifest.

### Phase 2: Compliance and field (8 weeks)
M7 Permits and park fees, M9 Field app (offline), M5 Supplier requests and payables, M12 Client portal, mobile money integration.

### Phase 3: Safety and scale (6–8 weeks)
M10 Safety and crew welfare, M11 Fleet maintenance, advanced reporting, agent/reseller portal, supplier portal, public booking site and widget.

### Phase 4: Ecosystem
Channel manager and OTA connections, iCal/Google Calendar, accounting integrations, API and webhooks for partners, optional AI features (itinerary drafting, quote summaries, multilingual client messages).

### MVP success metrics
- Quote built and sent in under 10 minutes for a standard multi-day safari
- Zero double-booked guides or vehicles in a pilot month
- Manifest generated with no manual re-entry
- At least 3 pilot operators running live departures

---

## 10. Non-functional requirements

| Area | Target |
|---|---|
| Availability | 99.5% for core API at launch |
| Performance | p95 API under 400 ms for common reads; quote recalculation under 1 s |
| Offline | Field app fully usable for a 14-day trip without signal |
| Localization | English and Swahili first; multi-currency (USD, TZS minimum) |
| Accessibility | WCAG 2.1 AA for web |
| Backup | Daily backups, tested restore, point-in-time recovery |
| Compliance | Data protection law of operating country plus international client data rules **[Verify]** |

---

## 11. Risks and open questions

**Risks**
1. **Park portal integration:** there may be no public API, which would mean assisted data entry or exports instead of live integration. Mitigate by designing the Permits module around export and verification first.
2. **Offline sync complexity:** budget real time for conflict handling and testing in poor networks.
3. **Adoption:** operators run on spreadsheets and WhatsApp. Mitigate with spreadsheet import, WhatsApp-friendly outputs and a very fast first-run experience.
4. **Pricing complexity:** seasonal, nationality-based and per-vehicle costs make the costing engine the hardest domain logic. Build it as a pure, heavily tested domain service.
5. **Payment compliance:** card and mobile-money providers have onboarding and regulatory requirements. **[Verify]**

**Open questions for you**
1. Who is the first customer: your own operation, partner operators, or a SaaS for the market?
2. Which segments first: classic safari, Kilimanjaro and treks, day tours, or all?
3. Is the platform B2B only, or does it also include a public booking marketplace?
4. Which payment methods and providers must be supported at launch?
5. Do you want agents (foreign DMCs) as users from day one?

---

## 12. Competitive positioning summary

| Dimension | Itinerary builders | Back-office ERPs | Booking platforms | **This product** |
|---|---|---|---|---|
| Visual proposals | Strong | Basic | Weak | Strong |
| Multi-day costing | Light | Strong | Weak | Strong |
| Guide/vehicle dispatch | None | Partial | Partial (day tours) | Strong |
| Offline field app | Client-side only | Rare | Some driver apps | Core |
| Park-authority workflow | None found | None found | None found | Core |
| Safety and crew welfare | None | None | None | Core |
| Modern UX and price | Good | Dated / costly | Good | Target |

**[Inference]** based on the sources below; validate in operator interviews.

---

## 13. Sources

- Capterra: GranIT Safari Software, Wetu, Tourplan, TourCMS, TrekkSoft, Zaui, Tour Manager, TripWorks reviews and listings
- G2: Best Tour Operator Software category and qualification criteria
- GetApp: Wetu feature listing and comparison pages
- FitGap: Wetu profile (strengths and limited transactional booking)
- Wetu blog and knowledge base (mobile safari setup, itinerary features, integrations)
- Zaui: fleet scheduling and wildlife/eco tour pages
- Simply Fleet: Basecamp Explorer (Kenya) case study; Fleetio: Safari Drive case study
- Sense of Africa notice on TANAPA reservation requirements effective 1 July 2025
- SafariGo and Duma Explorer guides on Tanzania park payment methods and fees (18% VAT); Tourism Update and ATTA on fee freezes and guide fee waivers
- Exim Bank / ATTA notes on the TANAPA and NCAA tour-operator card account
- Tanzania tour marketplace concept document (local payment and distribution challenges)
- Operator pages on Kilimanjaro safety and porter welfare: Peak Planet, Kandoo Adventures, Nature Discovery, Altezza Travel, Duma Explorer (KPAP)

*Park fees, rules and vendor features change frequently. Re-verify every **[Verify]** item before committing to a build.*
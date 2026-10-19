# Global Country Support, Google Sign-In Gate & Email Notification Plan

This plan updates the **Create Your Own Affiliate Store — Monolith Storefront** application to support creators across **all countries worldwide** (with the flexibility to add additional countries at any time), requires users to **Sign in with Google (Firebase Auth)** before submitting a storefront prototype request, emails the submitted details directly to `mukul.srivastava.025@gmail.com` (and stores a backup record in Firestore), and displays a dedicated confirmation popup modal.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions incorporate your confirmed answers while strictly preserving the existing visual design and layout of all sections:

- **Global Country Support & Expandable Geo-Routing**:
  - Updated copy across Hero, About, Services, Team, Contact, and Footer to reflect that storefronts can be created for **all countries worldwide** (USA, UK, India, EU, Canada, Australia, UAE, Japan, and more) and that creators can **add or expand to additional countries later** at any time.
  - Updated the **Primary Audience Region** field in the Contact form to a multi-country selector (`Global (All Countries)`, `USA ($)`, `India (₹)`, `United Kingdom (£)`, `European Union (€)`, `Canada (CA$)`, `Australia (A$)`, `UAE (AED)`, plus an optional custom country input) with a clear helper note: *"You can select multiple target countries now and easily add more countries to your storefront anytime later."*
- **Google Sign-In Gate (Firebase Auth)**:
  - Users are prompted to **Sign in with Google** before requesting a storefront prototype.
  - If an unauthenticated user fills out the form and clicks **Request Storefront Prototype** (or clicks the sign-in prompt in the form header), a clean Google Sign-In flow (`signInWithPopup`) authenticates them, automatically pre-fills their name/email, and lets them submit immediately.
- **Automated Email Delivery to `mukul.srivastava.025@gmail.com` + Firestore Record**:
  - Submitting the form dispatches a structured email payload via FormSubmit AJAX API (`https://formsubmit.co/ajax/mukul.srivastava.025@gmail.com`) containing the user's authenticated Google email, Full Name, Social Handle/URL, Creator Niche, Preferred Storefront Style, and Selected Target Countries.
  - Simultaneously saves the prototype request document in Firebase Firestore (`prototype_requests` collection) with strict security rules so no lead is ever lost.
- **Confirmation Popup Dialog**:
  - Immediately upon submission, a centered modal popup (`Dialog`) appears displaying:
    - **Title**: `Your Request is Submitted!`
    - **Message**: `"Your request is submitted, our team will contact you once your prototype is ready."`

---

## 1. Overview & Core Concept

- **What It Does**: Enables creators from any country in the world to authenticate with Google and request a tailored affiliate storefront prototype, automatically notifying `mukul.srivastava.025@gmail.com` with their complete profile and displaying an instant confirmation popup modal.
- **Target Audience / Persona**: Global creators and influencers who curate products for domestic or international audiences and want automatic currency/retailer geo-routing across all countries.
- **Key Value**: Removes regional limitations by supporting global multi-country storefronts (with on-demand country expansion later) while capturing verified, authenticated creator leads directly to your inbox.

---

## 2. User Experience & Visual Design

All existing visual animations, video backgrounds, darkroom clotheslines, film strips, and card styling remain untouched.

### Key User Flows

1. **Global Storefront Messaging**:
   - Visitors see updated copy across the Hero, About Film Strip, Services Darkroom Cards, Team/Themes Board, Contact Info Cards, and Footer emphasizing **Global Multi-Country Geo-Routing (All Countries Supported — Add New Countries Anytime)**.
2. **Authentication Before Requesting Prototype**:
   - Inside the **Reserve Your Storefront Build** form header, users see their authentication status.
   - If not signed in, a **"Sign in with Google to Request Prototype"** banner/button is shown, and clicking **"Request Storefront Prototype"** triggers Google Sign-In first before completing the submission.
   - Once signed in with Google, the user's verified email badge is shown and their name is pre-populated if empty.
3. **Submitting & Email Notification + Popup**:
   - User selects one or more target countries/regions (e.g., `Global / All Countries`, `USA`, `India`, `UK`, `EU`, `Canada`, `Australia`, `UAE`, or any custom country) and clicks **Request Storefront Prototype**.
   - The app sends the details to `mukul.srivastava.025@gmail.com` and records the entry in Firestore.
   - A modal popup opens with: *"Your request is submitted, our team will contact you once your prototype is ready."*

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Delivery (FormSubmit AJAX + Firestore Persistence)**
  - *Chosen Approach*: Send the lead details directly to `https://formsubmit.co/ajax/mukul.srivastava.025@gmail.com` from the submission handler and also write the lead to Firestore `prototype_requests`.
  - *Why*: Ensures instant email delivery to `mukul.srivastava.025@gmail.com` without requiring you to manually configure SMTP server credentials, while Firestore provides a permanent, tamper-proof database backup of every authenticated request.
- **Decision 2: Seamless Google Sign-In Gate**
  - *Chosen Approach*: Provision Firebase Authentication (Google provider) so users can sign in with a single click right in the Contact section (or automatically when clicking submit).
  - *Why*: Prevents spam requests, verifies the user's real email address to include in your notification email, and keeps the user on the landing page without losing their form inputs.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Contact Section (Contact.tsx)                     │
│  - Multi-Country Audience Selector (All Countries + Add More Later)      │
│  - Google Auth Gate (Firebase signInWithPopup)                           │
└───────────────────┬──────────────────────────────────┬───────────────────┘
                    │                                  │
                    ▼                                  ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────┐
│   Email Dispatch (FormSubmit AJAX)    │  │  Firebase Firestore Database  │
│ POST formsubmit.co/ajax/              │  │  Collection:                  │
│   mukul.srivastava.025@gmail.com      │  │  /prototype_requests/{reqId}  │
│ - Name, Verified Email, Social Handle │  │  - Validated via Security     │
│ - Niche, Theme, Selected Countries    │  │    Rules (isSignedIn + Owner) │
└───────────────────┬───────────────────┘  └───────────────┬───────────────┘
                    │                                      │
                    └──────────────────┬───────────────────┘
                                       ▼
                    ┌──────────────────────────────────────┐
                    │     Confirmation Popup (Dialog)      │
                    │  "Your request is submitted, our     │
                    │   team will contact you once your    │
                    │   prototype is ready."               │
                    └──────────────────────────────────────┘
```

### Data Model & Firestore Schema (`prototype_requests`)
- `uid`: Authenticated Google User UID (`request.auth.uid`)
- `userEmail`: Authenticated Google User Email
- `name`: Full Name (`string`, 1–100 chars)
- `handle`: Primary Social Handle or URL (`string`, 1–255 chars)
- `niche`: Selected Creator Niche (`string`)
- `theme`: Selected Storefront Style (`string`)
- `regions`: Selected target countries/regions (`string`, 1–500 chars)
- `createdAt`: Server timestamp (`request.time`)

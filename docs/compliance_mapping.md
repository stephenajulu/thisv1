# Data Governance & Regulatory Compliance Mapping

This document establishes the security, privacy, and data protection framework for the **Tropical Health Information System (THIS)**, mapping the offline-first clinical architecture against the international standard for information security (**ISO/IEC 27001:2022**), the European Union General Data Protection Regulation (**GDPR**), and the **Kenya Data Protection Act, 2019** (KDPA).

---

## 1. Regulatory Context & System Characteristics

THIS is a bedside clinical support system operating primarily in resource-constrained, remote outpost environments. Key architectural aspects impacting compliance include:
*   **Offline-First Sovereign Architecture**: Clinical diagnostic calculations (RUCAM, fluid drips, pediatric dosing) are calculated 100% locally client-side without transmitting patient health data over the internet.
*   **Zero Persistent PII (Personally Identifiable Information)**: Bedside patient records and triage logs are saved in localized, sandboxed `localStorage` databases. No clinical identifiers are uploaded to external databases.
*   **Netlify Identity OAuth Contribution Registry**: Access to administrative modifications and Decap CMS registry writing is locked behind secure role-based JSON Web Tokens (JWT).

---

## 2. ISO/IEC 27001:2022 Security Controls Mapping

THIS implements administrative and technical controls corresponding to **ISO 27001 Annex A** security requirements:

| ISO 27001 Control | Control Objective | THIS System Implementation |
| :--- | :--- | :--- |
| **A.5.15** | Access Control | Administrative access to Decap CMS (`/admin`) is gated by **Netlify Identity OAuth** and GitHub Git Gateway. Standard outpost practitioners are locked to read-only clinical tool roles. |
| **A.8.12** | Data Leakage Prevention | Zero patient PII is stored on central cloud servers. Bedside triage logs and epidemiological choropleths are sandboxed within the PWA browser sandbox, preventing cross-domain data leakage. |
| **A.8.20** | Network Security | All serverless webhook channels (e.g. peer review reports) and static asset delivery are forced over **HTTPS with TLS 1.3** and strict HSTS headers. |
| **A.8.24** | Use of Cryptography | Offline database backups and local browser cache values are stored within sandboxed browser environments. Contributor authentication utilize secure cryptographic JWT signatures. |
| **A.8.8** | Management of Technical Vulnerabilities | Pre-cached Service Worker assets and build bundles are scanned and validated against vulnerability databases using automated CI/CD dependency scans (`npm audit`). |

---

## 3. General Data Protection Regulation (GDPR) Mapping

Although operating in tropical health outposts, THIS adheres to strict GDPR privacy-by-design standards:

*   **Article 5: Principles of Processing (Data Minimization)**:
    *   *Implementation*: The bedside clinical calculators require only numerical inputs (weight, age, lab enzymes). The pediatric triage tool collects arbitrary names which are saved 100% locally. The system collects **zero** patient tracking IDs, phone numbers, or bio-metrics.
*   **Article 17: Right to Erasure ("Right to be Forgotten")**:
    *   *Implementation*: Outpost clinicians have full control over the browser-level sandbox. Under the **Logs** tab of both the Epidemic Heatmap and Clinician Reference modules, a simple "Delete / Reset" button executes a local `removeItem` cache clearance, instantly and permanently erasing all patient history.
*   **Article 32: Security of Processing (Encryption)**:
    *   *Implementation*: Build packages utilize modern Vite-Rolldown minification and secure service workers ensuring static registry resources are tamper-proof in the browser.

---

## 4. Kenya Data Protection Act, 2019 (KDPA) Mapping

As an application deployed in Kenyan county health outposts (e.g., Lodwar, Mombasa, Kakamega), THIS conforms directly to the KDPA framework administered by the Office of the Data Protection Commissioner (ODPC):

*   **Section 3: Objects of the Act (Sovereignty over Health Data)**:
    *   *Implementation*: Active county selection allows county-specific context overrides to be loaded dynamically from local JS bundles (`regionalOverrides.js`), ensuring regional epidemiological data sovereignty.
*   **Section 25: Principles of Data Protection (Consent and Purpose Limitation)**:
    *   *Implementation*: Bedside triage logs are saved within the local device memory. Clinicians are provided with interactive toggles to explicitly consent to log records locally or skip logging altogether.
*   **Section 29: Processing of Sensitive Personal Data (Health Records)**:
    *   *Implementation*: Traditional medicine ethnobotanical crowdsourcing utilizes strict moderation queues. Traditional practitioners contributing to the dynamic database are registered under voluntary pseudonyms or verified traditional titles to protect their intellectual and cultural property rights.
*   **Section 48: Transfer of Personal Data Outside Kenya**:
    *   *Implementation*: Since zero patient PII is uploaded to the cloud, there are no cross-border data transfer compliance risks. All diagnostic information stays at the physical bedside of the patient.

---

## 5. Security & Privacy Action Checklist for Outpost Clinicians

1.  **Browser Sandboxing**: Ensure devices used at bedside are configured with passcode locks to protect local `localStorage` triage databases.
2.  **Browser Cache Clearance**: Clear browser history and storage between shift changes using the "Reset Audit" controls on the Safety Checker and Clinician Reference portals.
3.  **Local Network Security**: Ensure local Wi-Fi hotspots utilized for weather alerting or sync processes are secured using WPA3 encryption.

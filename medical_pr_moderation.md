# Medical Peer-Review & GitHub PR Moderation Pipeline

To guarantee the scientific credibility, safety, and empirical accuracy of **THIS**, all visual contributions submitted via `/admin` (which automatically generate GitHub Pull Requests) or direct code edits must undergo a strict peer-review moderation pipeline.

---

## 👥 Contributor Roles & Privileges

```
[Community Contributor / Healer] ──(Submits Form / PR)──> [Reviewer Triage] ──(GRADE Audit)──> [Medical Editor] ──(Approves & Merges)──> Live Site
```

1.  **Researcher (Ethnobotanist / Pharmacologist)**:
    *   *Focus*: Botanical taxonomy, identifying synonyms, active compound extraction reviews, and indexing ethnobotanical traditional preparations.
    *   *Responsibility*: Must cross-reference traditional use-cases with active pre-clinical (in-vitro/animal) studies.
2.  **Clinician (Physician / Epidemologist)**:
    *   *Focus*: Reviewing patient dosage safety margins, auditing vulnerable demographic cautions (pregnancy contraindications), and confirming vector threat forecasting algorithms.
    *   *Responsibility*: Verifies that traditional botanical claims do not conflict with or delay standard WHO-first-line clinical cures.
3.  **Medical Editor (System Admin)**:
    *   *Focus*: Final quality gate, ensuring code compliance, and merging approved PRs to the `main` branch to trigger Netlify CDN deployments.

---

## 📋 GitHub Pull Request Peer-Review Template

*This template is automatically loaded in `.github/pull_request_template.md` to force contributors to document the empirical safety of any added remedy:*

```markdown
## 🩺 Clinical & Scientific Review Checklist

### 1. Target Entity
*   **Remedy / Disease Added**: 
*   **Scientific Name / Taxonomy**:

### 2. The Empirical Validation
*   **Primary Scientific Citations (PubMed IDs / WHO Guideline Refs)**: 
    *   *Example: PubMed ID: 32091204 / WHO Malaria Guidelines, Sec. 4.2*
*   **GRADE Quality Score**: [ ] High | [ ] Moderate | [ ] Low | [ ] Very Low
*   **GRADE Recommendation**: [ ] Strong For | [ ] Conditional For | [ ] Conditional Against | [ ] Strong Against

### 3. Safety & Toxicology Review
*   **Vulnerable Group Cautions Added?**:
    *   [ ] Pregnant Women alerts checked.
    *   [ ] Children Under 5 toxicity checked.
*   **Known Drug-Herb Interactions Listed**:

### 4. Ethnobotanical Respect
*   [ ] Ethnobotanical traditional preparation methods documented alongside the clinical pharmacological extraction data.
```

---

## 🛡️ The 5-Step Clinical Audit Protocol (Before Merging)

Before any Medical Editor merges a community contribution to `main`:

1.  **Double-Blind Check**: Ensure the primary study citation is a human RCT (Randomized Controlled Trial) or systematic review before allowing a **GRADE Quality: High** or **Moderate** badge. If the study was only conducted in-vitro or on animal cohorts, it *must* be downgraded to **GRADE: Low (Pre-clinical)**.
2.  **Safety First**: Ensure the remedy lists all known adverse events, hepatic/renal clearance warnings, and drug interactions. If a plant has historically documented abortifacient properties, a **CRITICAL Pregnancy Contraindication** banner must be active.
3.  **Traditional Alignment**: Ethnobotanical practices must be presented respectfully, highlighting their historical role, while clearly clarifying if modern clinical trials support (High Alignment), partially support (Emerging), or fail to support (Unaligned) the claim.
4.  **No Delays to First-Line Cures**: Botanical remedies must never be presented in a way that suggests they replace established life-saving first-line pharmaceuticals (like ACTs for malaria). They must be marked as "Adjuvant" or "Traditional Support".
5.  **Offline Compliance**: Verify that the newly added JSON data does not contain broken links or orphaned IDs, ensuring the offline PWA database remains 100% stable.

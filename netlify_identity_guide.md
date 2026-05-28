# Netlify Identity & Decap CMS Configuration Guide

This guide details the step-by-step instructions to deploy **THIS** to Netlify for free, activate **Netlify Identity**, and configure the visual back-office manager at `/admin` so invited doctors, botanists, and peer-reviewers can submit clinical edits securely.

---

## Step 1: Deploying the PWA to Netlify

1.  **Git Initialize & Commit**:
    Open PowerShell in the `THISv1` directory and execute:
    ```powershell
    git init
    git add .
    git commit -m "feat: initial commit of THIS clinical PWA"
    ```
2.  **Push to GitHub**:
    Create a new repository on GitHub (e.g. `this-tropical-health`) and link it:
    ```powershell
    git remote add origin https://github.com/YOUR_USERNAME/this-tropical-health.git
    git branch -M main
    git push -u origin main
    ```
3.  **Deploy on Netlify**:
    *   Log in to [Netlify](https://www.netlify.com/) (100% free starter tier).
    *   Click **"Add new site"** $\rightarrow$ **"Import from Git"** $\rightarrow$ Select your GitHub repository.
    *   Configure Build Settings:
        *   **Build Command**: `npm run build`
        *   **Publish Directory**: `dist`
    *   Click **"Deploy site"**. Netlify will build and host your PWA globally on their fast CDN.

---

## Step 2: Activating Netlify Identity

Decap CMS relies on Netlify Identity to handle logins and user authentication without a backend server database.

1.  **Enable Identity**:
    *   In the Netlify Site Dashboard, navigate to **Site configuration** $\rightarrow$ **Identity**.
    *   Click **Enable Identity**.
2.  **Configure Registration**:
    *   Under **Identity** $\rightarrow$ **Registration**, change registration from **Open** to **Invite Only**.
    *   *This ensures only clinicians and researchers you explicitly invite can log in and submit medical changes!*
3.  **Enable External Providers (Optional)**:
    *   Under **Registration**, you can enable Google or GitHub logins to make authentication seamless for invited contributors.
4.  **Activate Git Gateway**:
    *   Scroll down to the **Services** section in Identity settings.
    *   Click **Enable Git Gateway**. This authorizes Netlify to act on behalf of logged-in users to commit content directly to your GitHub repository.

---

## Step 3: Integrating Netlify Identity Widget

To allow the Netlify Identity widget to process redirection and logins:

1.  **Admin Redirect Script**:
    The Decap CMS configuration files we created inside `public/admin/` already load the required scripts.
2.  **Inviting a Contributor**:
    *   Go to **Identity** in Netlify $\rightarrow$ Click **"Invite users"**.
    *   Type the email address of a peer-reviewer (e.g. `colleague@hospital.org`).
    *   They will receive an email invite to accept, set a password, and will instantly have access to log in at `yoursite.com/admin` to edit plants, diseases, and outcome matrix items!

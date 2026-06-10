// netlify/functions/create-clinical-flag.js
// Netlify Serverless Function for Option A (Clinical Audit Trail)

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Retrieve authenticated user context if present (anonymous submissions are allowed)
    const user = context.clientContext && context.clientContext.user;

    const payload = JSON.parse(event.body || "{}");
    const { entityName, flagReason, details, userEmail } = payload;

    if (!entityName || !flagReason || !details) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Email format validation if provided
    if (userEmail && typeof userEmail === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail) || userEmail.length > 150) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: "Bad Request: Invalid email format" }),
        };
      }
    }

    // Reason mapping for friendly text & Whitelist Validation
    const reasonMap = {
      dosage: "Inaccurate Dosage Guideline",
      safety: "Omitted Safety Advisory / Pregnancy Caution",
      empirical: "Questionable Evidence / Missing Citation",
      identification: "Botanical Identification / Taxonomy Error",
    };

    if (!reasonMap[flagReason]) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Bad Request: Invalid flag category reason" }),
      };
    }

    // Input Sanitization (strip HTML tags) & Length Checks
    const cleanEntityName = entityName.replace(/<[^>]*>/g, "");
    const cleanDetails = details.replace(/<[^>]*>/g, "");
    const cleanEmail = userEmail ? userEmail.replace(/<[^>]*>/g, "") : "";

    if (cleanEntityName.length > 100 || cleanDetails.length > 2000) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Bad Request: Field lengths exceed safe boundaries" }),
      };
    }

    const reasonText = reasonMap[flagReason];
    const author = user ? user.email : (cleanEmail || "Anonymous Clinician");

    // 1. Create GitHub Issue if GITHUB_PAT is configured
    const githubToken = process.env.GITHUB_PAT;
    let githubIssueUrl = null;
    let githubIssueNum = null;

    if (githubToken) {
      const repo = process.env.GITHUB_REPO || "stephenajulu/thisv1";
      const issueTitle = `[Clinical Flag] ${cleanEntityName} - ${reasonText}`;
      const issueBody = `## 🚨 Clinical Advisory Report

**Condition/Remedy Flagged:** \`${cleanEntityName}\`
**Flag Category:** \`${reasonText}\`
**Submitted By:** \`${author}\`
**Timestamp:** \`${new Date().toISOString()}\`

### Clinical Details & References
${cleanDetails}

---
*This issue was automatically created by the bedside clinical audit system in the **THIS PWA**. Please review the database record and close this issue once resolved.*`;

      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
          method: "POST",
          headers: {
            "Authorization": `token ${githubToken}`,
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "THIS-Clinical-Audit-Bot",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: issueTitle,
            body: issueBody,
            labels: ["clinical-flag", "peer-review"],
          }),
        });

        if (response.ok) {
          const issueData = await response.json();
          githubIssueUrl = issueData.html_url;
          githubIssueNum = issueData.number;
          console.log(`Successfully created GitHub Issue #${githubIssueNum} at ${githubIssueUrl}`);
        } else {
          console.error("GitHub API returned error:", response.status, await response.text());
        }
      } catch (err) {
        console.error("Failed to post to GitHub:", err);
      }
    } else {
      console.warn("GITHUB_PAT is not defined in the server environment variables. Skipping GitHub Issue creation.");
    }

    // 2. Dispatch to Discord Webhook if configured
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      const discordPayload = {
        username: "THIS Clinical Advisory",
        avatar_url: "https://raw.githubusercontent.com/stephenajulu/thisv1/main/public/icon-192.png",
        embeds: [
          {
            title: "🚨 New Clinical Advisory Flag Raised",
            color: 15548997, // Rose/Red color
            url: githubIssueUrl || undefined,
            fields: [
              { name: "Clinical Entity", value: `\`${cleanEntityName}\``, inline: true },
              { name: "Flag Category", value: reasonText, inline: true },
              { name: "Submitted By", value: `\`${author}\``, inline: true },
            ],
            description: `**Clinical Details & References:**\n${cleanDetails}`,
            footer: {
              text: `THIS Clinical PWA • Issue #${githubIssueNum || "Offline Queue"}`
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      try {
        const response = await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        });
        if (!response.ok) {
          console.error("Discord Webhook returned error:", response.status, await response.text());
        }
      } catch (err) {
        console.error("Failed to post to Discord:", err);
      }
    }

    // 3. Dispatch to Slack Webhook if configured
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      const slackPayload = {
        text: `🚨 *New Clinical Advisory Flag Raised*\n*Entity:* \`${cleanEntityName}\`\n*Category:* ${reasonText}\n*By:* ${author}\n*Details:* ${cleanDetails}\n${githubIssueUrl ? `*GitHub Issue:* <${githubIssueUrl}|View Issue #${githubIssueNum}>` : ""}`,
      };

      try {
        const response = await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slackPayload),
        });
        if (!response.ok) {
          console.error("Slack Webhook returned error:", response.status, await response.text());
        }
      } catch (err) {
        console.error("Failed to post to Slack:", err);
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        issueUrl: githubIssueUrl,
        issueNumber: githubIssueNum,
        message: "Clinical advisory flag processed successfully",
      }),
    };
  } catch (err) {
    console.error("Error in create-clinical-flag handler:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: err.message }),
    };
  }
};

// Netlify Function config configuration for Rate Limiting (all plans)
export const config = {
  path: "/.netlify/functions/create-clinical-flag",
  rateLimit: {
    minRequests: 5,
    resetInterval: 60,
  },
};

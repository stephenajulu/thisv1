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
    const payload = JSON.parse(event.body || "{}");
    const { entityName, flagReason, details, userEmail } = payload;

    if (!entityName || !flagReason || !details) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Reason mapping for friendly text
    const reasonMap = {
      dosage: "Inaccurate Dosage Guideline",
      safety: "Omitted Safety Advisory / Pregnancy Caution",
      empirical: "Questionable Evidence / Missing Citation",
      identification: "Botanical Identification / Taxonomy Error",
    };
    const reasonText = reasonMap[flagReason] || flagReason;
    const author = userEmail || "Anonymous Clinician";

    // 1. Create GitHub Issue if GITHUB_PAT is configured
    // Secure token is configured in Netlify dashboard settings (not exposed to client)
    const githubToken = process.env.GITHUB_PAT;
    let githubIssueUrl = null;
    let githubIssueNum = null;

    if (githubToken) {
      // Default repository path
      const repo = process.env.GITHUB_REPO || "stephenajulu/thisv1";
      const issueTitle = `[Clinical Flag] ${entityName} - ${reasonText}`;
      const issueBody = `## 🚨 Clinical Advisory Report

**Condition/Remedy Flagged:** \`${entityName}\`
**Flag Category:** \`${reasonText}\`
**Submitted By:** \`${author}\`
**Timestamp:** \`${new Date().toISOString()}\`

### Clinical Details & References
${details}

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
        username: "THIS Clinical Audit Bot",
        avatar_url: "https://raw.githubusercontent.com/stephenajulu/thisv1/main/public/icon-192.png",
        embeds: [
          {
            title: "🚨 New Clinical Advisory Flag Raised",
            color: 15548997, // Warm Rose/Red color
            url: githubIssueUrl || undefined,
            fields: [
              { name: "Clinical Entity", value: `\`${entityName}\``, inline: true },
              { name: "Flag Category", value: reasonText, inline: true },
              { name: "Submitted By", value: `\`${author}\``, inline: true },
            ],
            description: `**Clinical Details & References:**\n${details}`,
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
        text: `🚨 *New Clinical Advisory Flag Raised*\n*Entity:* \`${entityName}\`\n*Category:* ${reasonText}\n*By:* ${author}\n*Details:* ${details}\n${githubIssueUrl ? `*GitHub Issue:* <${githubIssueUrl}|View Issue #${githubIssueNum}>` : ""}`,
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

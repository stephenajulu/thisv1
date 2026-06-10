// netlify/functions/sync-gateway.js
// Netlify Serverless Function for Secure Offline Synchronization & Pull Request Pipeline

export const handler = async (event, context) => {
  // CORS preflight options
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  // 1. Authenticate via Netlify Identity Context
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Unauthorized: Missing active Netlify Identity credentials" }),
    };
  }

  // Verify Role (admin, clinical-editor, moderator, or default fallback for setup convenience)
  const roles = user.app_metadata && user.app_metadata.roles;
  const isAuthorized = roles && (roles.includes("admin") || roles.includes("clinical-editor") || roles.includes("moderator"));
  
  if (process.env.NODE_ENV === "production" && !isAuthorized) {
    return {
      statusCode: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Forbidden: Outpost account lacks 'clinical-editor' or 'admin' roles" }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const { outpostCounty, syncQueue, userName } = payload;

    // Validate outpostCounty (must be present, alphanumeric/hyphens/spaces under 50 chars)
    if (!outpostCounty || typeof outpostCounty !== "string" || outpostCounty.length > 50) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Bad Request: Missing or invalid outpostCounty (must be a string under 50 characters)" }),
      };
    }
    const countyRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!countyRegex.test(outpostCounty)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Bad Request: outpostCounty contains invalid characters (alphanumeric, spaces, and hyphens only)" }),
      };
    }

    // Validate userName (optional, alphanumeric/dots/hyphens/spaces under 100 chars)
    if (userName) {
      if (typeof userName !== "string" || userName.length > 100) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: "Bad Request: userName must be under 100 characters" }),
        };
      }
      const userRegex = /^[a-zA-Z0-9\s.-]+$/;
      if (!userRegex.test(userName)) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: "Bad Request: userName contains invalid characters (alphanumeric, spaces, dots, and hyphens only)" }),
        };
      }
    }

    if (!syncQueue || !Array.isArray(syncQueue) || syncQueue.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Bad Request: Empty or invalid sync queue" }),
      };
    }

    // 1. Security Hardening: Enforce maximum queue length to prevent payload bloat DoS
    if (syncQueue.length > 50) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Bad Request: Sync queue exceeds maximum size of 50 items" }),
      };
    }

    // 2. Security Hardening: Validate each item to prevent directory path traversal and data pollution
    const allowedCollections = ["conditions", "remedies", "outcomes", "interactions"];
    const idRegex = /^[a-z0-9-]+$/;

    for (const item of syncQueue) {
      if (!item.collection || !allowedCollections.includes(item.collection)) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: `Bad Request: Unallowed collection target '${item.collection}'` }),
        };
      }

      if (!item.data || !item.data.id || !idRegex.test(item.data.id)) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: "Bad Request: Missing or malformed data ID (must be alphanumeric-hyphen only)" }),
        };
      }

      if (item.data.name && (typeof item.data.name !== "string" || item.data.name.length > 100)) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: "Bad Request: Item name must be a string under 100 characters" }),
        };
      }
    }

    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ 
          error: "Server Configuration Error: GitHub Access Token is not defined in the environment variables." 
        }),
      };
    }

    const repo = process.env.GITHUB_REPO || "stephenajulu/thisv1";
    const authorEmail = user.email || "outpost-editor@this.org";
    const authorName = userName || user.user_metadata?.full_name || "Outpost Clinician";
    
    // Create atomic unique branch & commit metadata
    const timestampStr = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const branchName = `pending-sync-${outpostCounty || "outpost"}-${timestampStr}`;
    const commitMessage = `Clinical outpost batch sync: ${outpostCounty || "General Outpost"} by ${authorName}`;

    // 2. Fetch Latest SHA of HEAD commit from main branch
    const headRefUrl = `https://api.github.com/repos/${repo}/git/ref/heads/main`;
    const headRefRes = await fetch(headRefUrl, {
      headers: {
        "Authorization": `token ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "THIS-Sync-Gateway"
      }
    });

    if (!headRefRes.ok) {
      throw new Error(`Failed to retrieve main HEAD: ${headRefRes.status} ${await headRefRes.text()}`);
    }

    const headRefData = await headRefRes.json();
    const mainSha = headRefData.object.sha;

    // 3. Construct File Blobs Tree Mapping
    const treeEntries = syncQueue.map(item => {
      // Serialize clean JSON structure with 2-space indents matching Decap styles
      const fileContent = JSON.stringify(item.data, null, 2) + "\n";
      const filename = `${item.data.id}.json`;
      const relativePath = `src/data/collections/${item.collection}/${filename}`;

      return {
        path: relativePath,
        mode: "100644",
        type: "blob",
        content: fileContent
      };
    });

    // 4. Create New Git Tree with base_tree set to mainSha (incremental additions)
    const treeUrl = `https://api.github.com/repos/${repo}/git/trees`;
    const treeRes = await fetch(treeUrl, {
      method: "POST",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "THIS-Sync-Gateway"
      },
      body: JSON.stringify({
        base_tree: mainSha,
        tree: treeEntries
      })
    });

    if (!treeRes.ok) {
      throw new Error(`Git tree creation failed: ${treeRes.status} ${await treeRes.text()}`);
    }
    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    // 5. Create New Git Commit
    const commitUrl = `https://api.github.com/repos/${repo}/git/commits`;
    const commitRes = await fetch(commitUrl, {
      method: "POST",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "THIS-Sync-Gateway"
      },
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [mainSha],
        author: {
          name: authorName,
          email: authorEmail,
          date: new Date().toISOString()
        }
      })
    });

    if (!commitRes.ok) {
      throw new Error(`Git commit creation failed: ${commitRes.status} ${await commitRes.text()}`);
    }
    const commitData = await commitRes.json();
    const newCommitSha = commitData.sha;

    // 6. Create Unique Branch Reference pointing to new Commit Sha
    const refUrl = `https://api.github.com/repos/${repo}/git/refs`;
    const refRes = await fetch(refUrl, {
      method: "POST",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "THIS-Sync-Gateway"
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: newCommitSha
      })
    });

    if (!refRes.ok) {
      throw new Error(`Branch reference creation failed: ${refRes.status} ${await refRes.text()}`);
    }

    // 7. Create Pull Request from unique branch into main
    const prUrl = `https://api.github.com/repos/${repo}/pulls`;
    const prRes = await fetch(prUrl, {
      method: "POST",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "THIS-Sync-Gateway"
      },
      body: JSON.stringify({
        title: `[Clinical Review] Outpost Sync - ${authorName} (${outpostCounty.toUpperCase()})`,
        head: branchName,
        base: "main",
        body: `## 📥 Offline Outpost Synchronization Report
        
**County Context Outpost:** \`${outpostCounty.toUpperCase()}\`
**Authorized Clinician:** \`${authorName} (${authorEmail})\`
**Timestamp:** \`${new Date().toLocaleString()}\`
**Items Synchronized:** \`${syncQueue.length} records\`

### Staged Items Breakdown:
${syncQueue.map((item, idx) => `${idx + 1}. **[${item.collection.toUpperCase()}]** \`${item.data.name}\` (Action: \`${item.action}\`)`).join("\n")}

---
*This PR was automatically created by the secure **Netlify Serverless Sync Gateway** after an authenticated outpost clinician reconnected and uploaded their local storage queue. Please inspect the diff fields for dosage, safety contraindications, and GRADE compliance before merging to the production registry.*`
      })
    });

    let prData = {};
    if (prRes.ok) {
      prData = await prRes.json();
    } else {
      console.warn("Pull Request creation warning:", prRes.status, await prRes.text());
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        branch: branchName,
        commitSha: newCommitSha,
        prUrl: prData.html_url || null,
        prNumber: prData.number || null,
        message: "Staged entries successfully synchronized and staged for review",
      }),
    };

  } catch (err) {
    console.error("Error in sync-gateway handler:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Internal Server Error", details: err.message }),
    };
  }
};

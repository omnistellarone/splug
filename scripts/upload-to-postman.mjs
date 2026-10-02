/**
 * Postman Collection Cloud Uploader
 * 
 * Usage:
 *   node scripts/upload-to-postman.mjs <POSTMAN_API_KEY> [WORKSPACE_ID]
 * 
 * Or set POSTMAN_API_KEY in your environment:
 *   $env:POSTMAN_API_KEY="PMAK-..."
 *   node scripts/upload-to-postman.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionPath = path.resolve(__dirname, "../postman/slurge-api.postman_collection.json");

async function upload() {
  const apiKey = process.argv[2] || process.env.POSTMAN_API_KEY;
  const workspaceId = process.argv[3] || process.env.POSTMAN_WORKSPACE_ID;

  if (!apiKey) {
    console.error("❌ Error: Missing Postman API Key.");
    console.log("Usage: node scripts/upload-to-postman.mjs <POSTMAN_API_KEY> [WORKSPACE_ID]");
    console.log("You can generate an API key at https://go.postman.co/settings/me/api-keys");
    process.exit(1);
  }

  if (!fs.existsSync(collectionPath)) {
    console.error(`❌ Collection file not found at: ${collectionPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(collectionPath, "utf-8");
  const collectionJson = JSON.parse(raw);

  let url = "https://api.getpostman.com/collections";
  if (workspaceId) {
    url += `?workspace=${encodeURIComponent(workspaceId)}`;
  }

  console.log("🚀 Uploading Slurge API Collection to Postman Cloud...");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection: collectionJson,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Postman API Error:", result);
      process.exit(1);
    }

    console.log("✅ Successfully created Postman Collection!");
    console.log("Collection Name:", result.collection?.name);
    console.log("Collection ID:", result.collection?.id);
    console.log("Collection UID:", result.collection?.uid);
  } catch (err) {
    console.error("❌ Network or Execution Error:", err);
    process.exit(1);
  }
}

upload();

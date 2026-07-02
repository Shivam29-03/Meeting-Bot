import axios from "axios";

const region = process.env.RECALL_REGION;
const apiKey = process.env.RECALL_API_KEY;

if (!region) {
  throw new Error("Missing RECALL_REGION in .env.local");
}

if (!apiKey) {
  throw new Error("Missing RECALL_API_KEY in .env.local");
}

const recallClient = axios.create({
  baseURL: `https://${region}.recall.ai/api/v1`,
  timeout: 30000,
  headers: {
    Authorization: apiKey,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default recallClient;

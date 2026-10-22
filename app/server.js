// Frontend (tier 1) of the visitor-counter app. Backend (tier 2) = Redis.
// Logging is intentionally disabled to save CloudWatch ingestion cost.
const express = require("express");
const { createClient } = require("redis");

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redis = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
redis.on("error", () => {}); // silent on purpose
redis.connect().catch(() => {});

// UI
app.get("/", async (req, res) => {
  let count = "unavailable";
  try { count = await redis.incr("visits"); } catch (e) {}
  res.send(`<!doctype html><html><head><title>FoCC Lab2</title></head>
  <body style="font-family:sans-serif;text-align:center;margin-top:10%">
  <h1>Visitor Counter</h1><h2>Visits: ${count}</h2>
  <p>Served by pod: ${process.env.HOSTNAME}</p>
  <p>Prince Jaiswal | PU02424EUG10032 | FoCC Lab 2</p></body></html>`);
});

// API
app.get("/api/visits", async (req, res) => {
  try { res.json({ visits: Number(await redis.get("visits")) || 0, pod: process.env.HOSTNAME }); }
  catch (e) { res.status(503).json({ error: "redis unavailable" }); }
});

// Liveness: process is alive (does NOT depend on Redis)
app.get("/healthz", (req, res) => res.status(200).send("ok"));

// Readiness: only ready when Redis answers
app.get("/ready", async (req, res) => {
  try { await redis.ping(); res.status(200).send("ready"); }
  catch (e) { res.status(503).send("redis not ready"); }
});

// CPU-heavy endpoint used only for load testing (~30 ms of busy work)
app.get("/cpu", (req, res) => {
  const end = Date.now() + 30;
  let x = 0;
  while (Date.now() < end) { x += Math.sqrt(Math.random() * 1e6); }
  res.json({ ok: true, pod: process.env.HOSTNAME });
});

app.listen(PORT, "0.0.0.0");

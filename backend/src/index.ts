import express from "express";

const app = express();
const PORT = 4000;

app.get("/", (_req, res) => {
  res.send("Hello from Express + TypeScript backend!");
});

// 疎通確認用の API
app.get("/api/test", (_req, res) => {
  res.json({ message: "API is working fine 🎉" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

"use client";

import { useEffect, useState } from "react";

export default function ApiTestPage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:4000/api/test") // 👈 修正
      .then((res) => res.text())
      .then((text) => setMessage(text))
      .catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>フロントからバックエンド疎通確認</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

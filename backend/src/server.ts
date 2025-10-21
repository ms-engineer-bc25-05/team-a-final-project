import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log("=======================================");
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🧠 NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔑 OpenAI key loaded: ${Boolean(process.env.OPENAI_API_KEY)}`);
  console.log("=======================================");
});
import express from "express";
const router = express.Router();

// POST /api/mood
router.post("/", (req, res) => {
  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({ error: "moodが未指定です" });
  }

  console.log("📩 受信した気分:", mood);

  // 今はログ出力のみ（後でFirestore保存に拡張）
  return res.status(200).json({ message: "気分を受け取りました", mood });
});

export default router;

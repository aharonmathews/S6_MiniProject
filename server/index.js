const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      console.error("❌ No file or buffer found in request.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📦 File received:", req.file.originalname);

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
    });

    const response = await axios.post(
      "http://127.0.0.1:5001/api/v0/add",
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const cid = response.data.Hash;
    console.log("✅ Uploaded to IPFS:", cid);
    res.json({ cid });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

app.listen(4000, () => {
  console.log("✅ Server running on http://localhost:4000");
});

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Helper function to transcribe audio
const transcribeAudio = async (filePath) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), "recording.wav");
  formData.append("model", "whisper-1");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return null;
  }
};

// Route for transcribing uploaded audio
router.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const transcription = await transcribeAudio(filePath);

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    if (transcription) {
      res.json({ transcription });
    } else {
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  } catch (error) {
    console.error("Error processing transcription:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

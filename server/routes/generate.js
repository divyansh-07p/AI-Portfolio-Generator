const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const { createPortfolioZip } = require('../utils/portfolioBuilder'); // We'll create this next

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    cb(null, isImage ? 'uploads/' : 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });

// Main POST route
router.post('/', upload.fields([{ name: 'resume' }, { name: 'profilePic' }]), async (req, res) => {
  try {
    const resumeFile = req.files['resume'][0];
    const profilePicFile = req.files['profilePic']?.[0] || null;
    const preferences = req.body.preferences;

    // Parse PDF Resume
    const resumeBuffer = fs.readFileSync(resumeFile.path);
    console.log("Parsing PDF...");
    const parsedData = await pdfParse(resumeBuffer);
    console.log("Parsed text:", parsedData.text);
    const extractedText = parsedData.text;

    console.log("Extracting user data...");
    // 🔍 VERY basic data extraction
    const userData = extractUserData(extractedText);
    userData.preferences = preferences;
    userData.profilePicPath = profilePicFile ? `/uploads/${profilePicFile.filename}` : null;

    // Generate HTML/CSS/JS using Gemini (we'll do this in Phase 4)
    console.log("Generating ZIP...");
    const zipPath = await createPortfolioZip(userData); // this function will generate and return zip path
    console.log("ZIP Path:", zipPath);

    return res.json({ downloadUrl: zipPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error generating portfolio' });
  }
});

// Simple extractor for name/email/education
function extractUserData(text) {
  const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi);

  const educationKeywords = ['B.Tech', 'M.Tech', 'BSc', 'MSc', 'Bachelor', 'Master'];
  const educationLines = text
    .split('\n')
    .filter((line) => educationKeywords.some((word) => line.includes(word)));

  const skillsSection = text.split(/skills|technologies|tools/i)[1] || '';
  const skills = skillsSection
    .split(/[\n,•\-]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 50)
    .slice(0, 10);

  return {
    name: nameMatch ? nameMatch[0] : 'John Doe',
    email: emailMatch ? emailMatch[0] : 'example@email.com',
    bio: 'A passionate individual looking to showcase my skills.',
    education: educationLines,
    skills,
  };
}

module.exports = router;

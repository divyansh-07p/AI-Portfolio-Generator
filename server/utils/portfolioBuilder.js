const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Replace this with your Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function generatePrompt(userData) {
  return `
Create a modern, aesthetic, responsive personal portfolio website using ONLY HTML, CSS and JavaScript.

Details:
- Name: ${userData.name}
- Bio: ${userData.bio}
- Skills: ${userData.skills.join(', ')}
- Education: ${userData.education.map(e => `${e.degree} from ${e.institute} (${e.year})`).join('; ')}

Requirements:
- Show profile picture in header.
- Education in a styled HTML table.
- Skills with progress bars.
- Add one interactive JS element: (e.g. dark mode toggle, typing effect, or scroll animation).
- Use beautiful modern UI with unique layout and font.
- Structure using semantic HTML5.
- Output only clean code — wrap all HTML, CSS, JS in appropriate <style> and <script> tags.
`;
}

async function createPortfolioZip(userData) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = generatePrompt(userData);

  const result = await model.generateContent(prompt);
  const code = result.response.text();

  const tempFolder = path.join(__dirname, '../temp');
  const outputFolder = path.join(__dirname, '../portfolios');
  if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${userData.name}'s Portfolio</title>
  </head>
  <body>
  ${code}
  </body>
  </html>`;

  const timestamp = Date.now();
  const fileName = `portfolio-${timestamp}.zip`;
  const filePath = path.join(outputFolder, fileName);

  const output = fs.createWriteStream(filePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.append(htmlContent, { name: 'index.html' });
  archive.finalize();

  return `/portfolios/${fileName}`;
}

module.exports = {
  createPortfolioZip,
};

// utils/dataExtractor.js

const extractUserDataFromText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  const fullText = lines.join(' ');

  const extractField = (regex) => {
    const match = fullText.match(regex);
    return match ? match[1].trim() : null;
  };

  const name = lines[0]; // assuming name is the first line
  const email = extractField(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phone = extractField(/(\+?\d{2,3}[-\s]?\d{10})/);
  const linkedin = extractField(/(linkedin\.com\/[^\s]+)/i);
  const github = extractField(/(github\.com\/[^\s]+)/i);
  const location = extractField(/([A-Z][a-z]+,\s?[A-Z][a-z]+)/);

  const education = [];
  let collectingEdu = false;
  lines.forEach((line, i) => {
    if (line.toLowerCase().includes('education')) collectingEdu = true;
    else if (collectingEdu && /\d{4}\s?[–-]\s?\d{4}/.test(line)) {
      const institute = lines[i];
      const duration = line;
      const nextLine = lines[i + 1] || '';
      const cgpaMatch = nextLine.match(/CGPA[:\s]([\d.]+)/i);
      const percentageMatch = nextLine.match(/Percentage[:\s]?([\d.]+%?)/i);
      education.push({
        institute,
        degree: nextLine.split('—')[0].trim(),
        duration,
        cgpa: cgpaMatch ? cgpaMatch[1] : percentageMatch ? percentageMatch[1] : null,
      });
    }
  });

  const skillsSection = fullText.match(/Skills(.*?)Education/i);
  const skillsText = skillsSection ? skillsSection[1] : '';
  const skills = {
    languages: [...skillsText.match(/Languages:\s*(.*?)(?=Libraries|Tools|$)/i) || []][1]?.split(',').map(s => s.trim()) || [],
    libraries: [...skillsText.match(/Libraries:\s*(.*?)(?=Tools|Coursework|$)/i) || []][1]?.split(',').map(s => s.trim()) || [],
    tools: [...skillsText.match(/Tools:\s*(.*?)(?=Coursework|$)/i) || []][1]?.split(',').map(s => s.trim()) || [],
    coursework: [...skillsText.match(/Coursework:\s*(.*?)(?=Soft Skills|$)/i) || []][1]?.split(',').map(s => s.trim()) || [],
  };

  const softSkills = [...skillsText.match(/Soft Skills\s*:\s*(.*)/i) || []][1]?.split(',').map(s => s.trim()) || [];

  const projectRegex = /([A-Z][^\n]+)\| ([^|]+) (\w+ \d{4} - \w+ \d{4})/g;
  const projects = [];
  let projMatch;
  while ((projMatch = projectRegex.exec(fullText)) !== null) {
    const [_, title, tech, duration] = projMatch;
    const descStart = fullText.indexOf(projMatch[0]) + projMatch[0].length;
    const descEnd = fullText.indexOf('•', descStart);
    const description = fullText.slice(descStart, descEnd !== -1 ? descEnd : undefined).trim();
    projects.push({
      title: title.trim(),
      tech: tech.split(',').map(s => s.trim()),
      duration,
      description
    });
  }

  const certRegex = /([^\n]+)\s+(\w+ \d{4})\s+([\w\s]+)/g;
  const certifications = [];
  let certMatch;
  while ((certMatch = certRegex.exec(fullText)) !== null) {
    certifications.push({
      title: certMatch[1].trim(),
      date: certMatch[2].trim(),
      platform: certMatch[3].trim()
    });
  }

  return {
    name,
    email,
    phone,
    linkedin,
    github,
    location,
    education,
    skills,
    softSkills,
    projects,
    certifications,
  };
};

module.exports = extractUserDataFromText;

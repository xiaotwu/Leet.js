// update-and-clean-readme.js
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const LEETCODE_TOTALS = {
  Easy: 876,
  Medium: 1840,
  Hard: 833,
};
const TOTAL_PROBLEMS = Object.values(LEETCODE_TOTALS).reduce((a, b) => a + b);

const README_FILE = "README.md";
const PROBLEMS_DIR = "problems";
const DIFFICULTIES_DIR = "difficulties";
const DIFFICULTY_FILES = {
  Easy: "easy.md",
  Medium: "medium.md",
  Hard: "hard.md",
};

const DIFFICULTY_ICONS = {
  Easy: "📗",
  Medium: "📙",
  Hard: "📕",
};

function cleanHeader(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const titleMatch = content.match(/\[\d+\]\s+.+/);
  const urlMatch = content.match(/https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/?/i);
  const difficultyMatch = content.match(/\n\s*\*\s+(Easy|Medium|Hard)\s/i);

  if (titleMatch && urlMatch && difficultyMatch) {
    const titleLine = titleMatch[0].trim();
    const url = urlMatch[0].replace(/\/description\/?$/, "/");
    const difficulty = difficultyMatch[1].trim();
    const newHeader = `/**\n * ${titleLine.replace("] ", `] [${difficulty}] `)}\n * ${url}\n */`;
    content = content.replace(/\/\*[\s\S]*?\*\/\n*/, newHeader + "\n");
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`😸 Cleaned: ${path.basename(filePath)}`);
  } else {
    console.warn(`😿 Skipped (missing info): ${path.basename(filePath)}`);
  }
}

function extractProblemInfo(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.split("\n").slice(0, 10);
  let info = { filepath };

  for (const line of lines) {
    const trimmed = line.trim();
    const headerMatch = trimmed.match(/^\*?\s*\[(\d+)\]\s*\[(Easy|Medium|Hard)\]\s*(.+)$/i);
    const urlMatch = trimmed.match(/^\*?\s*(https:\/\/leetcode\.com\/problems\/[^/]+\/?)/i);

    if (headerMatch) {
      info.number = headerMatch[1];
      info.difficulty = headerMatch[2];
      info.title = headerMatch[3];
    }
    if (urlMatch) {
      info.link = urlMatch[1];
    }
  }

  if (info.difficulty && info.number && info.title && info.link) {
    return info;
  }
  return null;
}

function generateProgressBar(percent, length = 24) {
  const filled = Math.round((percent / 100) * length);
  return "█".repeat(filled) + "░".repeat(length - filled);
}

function ensureHeaderBlock(readme, totalSolved, date) {
  const nerdFontStyle = `\n<link rel=\"stylesheet\" href=\"https://www.nerdfonts.com/assets/css/webfont.css\">`;
  const encodedDate = encodeURIComponent(date.replace(/-/g, "__"));
  const titleBlock = `<div align=\"center\">\n\n# <i class=\"nf nf-md-language_javascript\"></i> Leet.js\n\nSolving LeetCode problems with modern JavaScript.\n\n` +
    `![Language](https://img.shields.io/badge/Language-JavaScript-yellow?logo=javascript)\n` +
    `![Solved](https://img.shields.io/badge/Solved-${totalSolved}-blue?logo=leetcode)\n` +
    `![Last Updated](https://img.shields.io/badge/Last__Update-${encodedDate}-brightgreen?style=flat-square)\n\n</div>\n`;

  const blockRegex = /<div align=\"center\">[\s\S]*?<\/div>\n?/;
  const markdownRegex = /^#\s+Leet\.js.*?(\n|\r\n)/;
  readme = readme.replace(blockRegex, "");
  readme = readme.replace(markdownRegex, "");

  return nerdFontStyle + "\n" + titleBlock + "\n" + readme.trimStart();
}

function updateReadme(readmePath, problems) {
  let readme = fs.readFileSync(readmePath, "utf-8");
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of problems) counts[p.difficulty]++;

  const totalSolved = problems.length;
  const totalPercent = (totalSolved / TOTAL_PROBLEMS) * 100;
  const date = dayjs().format("YYYY-MM-DD");

  readme = ensureHeaderBlock(readme, totalSolved, date);

  readme = readme.replace(/<!-- LAST_UPDATED_DATE -->.*?<!-- \/LAST_UPDATED_DATE -->/, `<!-- LAST_UPDATED_DATE -->${date}<!-- /LAST_UPDATED_DATE -->`);
  readme = readme.replace(/<!-- TOTAL_SOLVED_COUNT -->.*?<!-- \/TOTAL_SOLVED_COUNT -->/, `<!-- TOTAL_SOLVED_COUNT -->**${totalSolved}**<!-- /TOTAL_SOLVED_COUNT -->`);
  readme = readme.replace(/<!-- TOTAL_PROGRESS_PERCENT -->.*?<!-- \/TOTAL_PROGRESS_PERCENT -->/, `<!-- TOTAL_PROGRESS_PERCENT -->**${totalPercent.toFixed(1)}**<!-- /TOTAL_PROGRESS_PERCENT -->`);
  readme = readme.replace(/<!-- TOTAL_PROGRESS_BAR -->.*?<!-- \/TOTAL_PROGRESS_BAR -->/, `<!-- TOTAL_PROGRESS_BAR -->**${generateProgressBar(totalPercent)}**<!-- /TOTAL_PROGRESS_BAR -->`);

  for (const [difficulty, count] of Object.entries(counts)) {
    const total = LEETCODE_TOTALS[difficulty];
    const percent = (count / total) * 100;
    readme = readme.replace(new RegExp(`<!-- ${difficulty.toUpperCase()}_SOLVED_COUNT -->.*?<!-- \/${difficulty.toUpperCase()}_SOLVED_COUNT -->`), `<!-- ${difficulty.toUpperCase()}_SOLVED_COUNT -->${count}<!-- /${difficulty.toUpperCase()}_SOLVED_COUNT -->`);
    readme = readme.replace(new RegExp(`<!-- ${difficulty.toUpperCase()}_PROGRESS_PERCENT -->.*?<!-- \/${difficulty.toUpperCase()}_PROGRESS_PERCENT -->`), `<!-- ${difficulty.toUpperCase()}_PROGRESS_PERCENT -->${percent.toFixed(1)}<!-- /${difficulty.toUpperCase()}_PROGRESS_PERCENT -->`);
    readme = readme.replace(new RegExp(`<!-- ${difficulty.toUpperCase()}_PROGRESS_BAR -->.*?<!-- \/${difficulty.toUpperCase()}_PROGRESS_BAR -->`), `<!-- ${difficulty.toUpperCase()}_PROGRESS_BAR -->${generateProgressBar(percent)}<!-- /${difficulty.toUpperCase()}_PROGRESS_BAR -->`);
    readme = readme.replace(new RegExp(`<!-- ${difficulty.toUpperCase()}_TOTAL_BADGE -->.*?<!-- \/${difficulty.toUpperCase()}_TOTAL_BADGE -->`), `<!-- ${difficulty.toUpperCase()}_TOTAL_BADGE -->${count}<!-- /${difficulty.toUpperCase()}_TOTAL_BADGE -->`);
  }

  readme = readme.replace(/<!-- PIE_CHART_DATA_START -->[\s\S]*?<!-- PIE_CHART_DATA_END -->/, `<!-- PIE_CHART_DATA_START -->\n    "Easy" : ${counts.Easy}\n    "Medium" : ${counts.Medium}\n    "Hard" : ${counts.Hard}\n    <!-- PIE_CHART_DATA_END -->`);

  fs.writeFileSync(readmePath, readme, "utf-8");
}

function updateDifficultyFiles(problems) {
  const grouped = { Easy: [], Medium: [], Hard: [] };
  for (const p of problems) {
    if (grouped[p.difficulty]) {
      grouped[p.difficulty].push(p);
    }
  }

  for (const [difficulty, list] of Object.entries(grouped)) {
    list.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    let output = `# ${DIFFICULTY_ICONS[difficulty]} ${difficulty} Problems\n\n`;
    output += `| # | Title | Solution |\n|---|-------|----------|\n`;
    for (const p of list) {
      const file = path.basename(p.filepath);
      output += `| ${p.number} | [${p.title}](${p.link}) | [${file}](../problems/${file}) |\n`;
    }
    const mdPath = path.join(DIFFICULTIES_DIR, DIFFICULTY_FILES[difficulty]);
    fs.mkdirSync(DIFFICULTIES_DIR, { recursive: true });
    fs.writeFileSync(mdPath, output, "utf-8");
  }
}

function main() {
  const files = fs.readdirSync(PROBLEMS_DIR).filter(f => f.endsWith(".js"));
  files.forEach(file => cleanHeader(path.join(PROBLEMS_DIR, file)));

  const problems = [];
  for (const file of files) {
    const fullPath = path.join(PROBLEMS_DIR, file);
    const info = extractProblemInfo(fullPath);
    if (info) problems.push(info);
  }

  if (fs.existsSync(README_FILE)) {
    updateReadme(README_FILE, problems);
  }

  updateDifficultyFiles(problems);
  console.log("😸 Cleaned headers and updated README/difficulty files.");
}

main();

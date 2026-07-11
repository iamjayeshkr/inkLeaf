const fs = require('fs');

const logPath = '/Users/rudra/.gemini/antigravity-ide/brain/2c692ef3-6306-4853-a78b-ef60d49ec29b/.system_generated/logs/transcript_full.jsonl';
if (!fs.existsSync(logPath)) {
  console.error("Log file does not exist");
  process.exit(1);
}

const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (let line of lines) {
  if (!line) continue;
  if (line.includes('Page (webpack-internal')) {
    console.log("\n=== FOUND STACK TRACE IN TRANSCRIPT ===");
    // Print around the stack trace
    const index = line.indexOf('Page (webpack-internal');
    const start = Math.max(0, index - 800);
    const end = Math.min(line.length, index + 1000);
    console.log(line.substring(start, end).replace(/\\n/g, '\n').replace(/\\"/g, '"'));
  }
}

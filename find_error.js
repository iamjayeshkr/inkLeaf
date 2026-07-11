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
  try {
    const data = JSON.parse(line);
    if (data.content && data.content.includes("browser_subagent")) {
      // Print lines containing stack trace errors
      const subLines = data.content.split('\\n');
      subLines.forEach(l => {
        if (l.includes("error") || l.includes("Error") || l.includes("Exception") || l.includes("TypeError") || l.includes("ReferenceError")) {
          console.log(`[Step ${data.step_index}] ->`, l);
        }
      });
    }
    if (data.content && data.content.includes("Browser subagent result")) {
      console.log(`[Step ${data.step_index}] Result Summary:`);
      console.log(data.content);
    }
  } catch (e) {}
}

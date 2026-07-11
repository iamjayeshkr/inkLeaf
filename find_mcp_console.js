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
  if (line.toLowerCase().includes('get_console_message') || line.toLowerCase().includes('console') || line.toLowerCase().includes('devtools')) {
    console.log(`\n=== MATCH (Line length: ${line.length}) ===`);
    console.log(line.substring(0, 2000));
  }
}

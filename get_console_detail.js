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
    // Find lines referencing capture_browser_console_logs
    if (JSON.stringify(data).includes('capture_browser_console_logs')) {
      console.log(`\n=== STEP ${data.step_index} MATCH ===`);
      // Print the content or tool results if available
      if (data.content) console.log("Content:", data.content);
      if (data.tool_calls) console.log("Tool Calls:", JSON.stringify(data.tool_calls, null, 2));
    }
  } catch (e) {}
}

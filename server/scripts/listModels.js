const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => {
        console.log(`  ${m.name}`);
      });
    } else {
      console.log('No models returned. Response:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

run();

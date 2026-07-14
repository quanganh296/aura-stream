const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function test() {
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent("Hello, respond in 1 word.");
    console.log('Success with gemini-3.1-flash-lite! Response:', result.response.text().trim());
  } catch (err) {
    console.error('Failed:', err.message);
  }
  process.exit(0);
}

test();

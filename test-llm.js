// Simple test script for Hugging Face API
const API_KEY = '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';
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.3';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

async function testLLMAPI() {
  console.log('Testing Hugging Face API...');
  console.log(`Model: ${MODEL_ID}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`API URL: ${API_URL}`);
  
  const prompt = `<s>[INST] You are participating in a respectful debate about: "Should AI be regulated by governments?"

The other person argues for and said: "AI regulation is necessary to prevent misuse and protect citizens from potential harm."

You argue against. Provide a thoughtful counter-argument in 2-3 sentences. Be persuasive but respectful. [/INST]`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 120,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      }),
    });

    console.log(`Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    let content = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text.trim();
    } else if (data.generated_text) {
      content = data.generated_text.trim();
    }
    
    console.log('Generated Content:', content);
      } catch (error) {
    console.error('API Test Failed:', error.message);
    console.error('Full error:', error);
  }
}

// Add error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Starting test...');
testLLMAPI().then(() => {
  console.log('Test completed');
}).catch((error) => {
  console.error('Test script error:', error);
});

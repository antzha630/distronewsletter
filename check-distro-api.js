const axios = require('axios');
const config = require('./config');

async function checkDistroAPI() {
  console.log('🔍 Checking Distro API for articles...');
  
  try {
    // Try to get articles from the API (if it supports GET requests)
    const response = await axios.get(config.distro.apiEndpoint, {
      headers: {
        'Authorization': `Bearer ${config.distro.apiKey}`,
        'X-API-Key': config.distro.apiKey
      },
      timeout: 10000
    });
    
    console.log('✅ API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('ℹ️  API might not support GET requests, but POST requests are working');
    console.log('📊 To verify articles are being sent:');
    console.log('   1. Check your Distro platform dashboard');
    console.log('   2. Look for articles with titles like "Wall Street Doubles Down on ETH"');
    console.log('   3. Check the console logs when processing feeds');
    
    if (error.response) {
      console.log(`   API Status: ${error.response.status}`);
      console.log(`   API Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

checkDistroAPI(); 
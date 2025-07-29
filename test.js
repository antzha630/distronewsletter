const FeedProcessor = require('./src/feedProcessor');

async function testFeedProcessor() {
  console.log('Testing Distro Newsletter Mode...');
  
  const processor = new FeedProcessor();
  
  // Test with a sample Atom feed (you can replace this with a real Kill the Newsletter! feed)
  const testFeedUrl = 'https://feeds.feedburner.com/TechCrunch';
  const sourceName = 'TechCrunch Test';
  
  try {
    console.log('Fetching test feed...');
    const entries = await processor.fetchFeed(testFeedUrl);
    
    if (entries.length > 0) {
      console.log(`Found ${entries.length} entries`);
      
      // Test conversion to Distro schema
      const distroData = processor.convertToDistroSchema(entries[0], sourceName);
      
      console.log('Converted to Distro schema:');
      console.log(JSON.stringify(distroData, null, 2));
      
      // Test sending to Distro API (commented out to avoid actual API calls during testing)
      // console.log('Sending to Distro API...');
      // await processor.sendToDistro(distroData);
      
      console.log('✅ Test completed successfully!');
    } else {
      console.log('No entries found in feed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFeedProcessor(); 
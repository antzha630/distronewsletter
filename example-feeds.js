// Example configuration for Kill the Newsletter! feeds
// Copy this structure to src/feedProcessor.js in the processAllFeeds() method

const exampleFeeds = [
  {
    url: 'https://kill-the-newsletter.com/feeds/your-feed-id-1.xml',
    source: 'TechCrunch Newsletter'
  },
  {
    url: 'https://kill-the-newsletter.com/feeds/your-feed-id-2.xml', 
    source: 'The Verge Newsletter'
  },
  {
    url: 'https://kill-the-newsletter.com/feeds/your-feed-id-3.xml',
    source: 'Product Hunt Newsletter'
  }
];

// To use these feeds:
// 1. Replace the URLs with your actual Kill the Newsletter! feed URLs
// 2. Update the source names to match your newsletter names
// 3. Add this array to the processAllFeeds() method in src/feedProcessor.js

console.log('Example feeds configuration:');
console.log(JSON.stringify(exampleFeeds, null, 2));

module.exports = exampleFeeds; 
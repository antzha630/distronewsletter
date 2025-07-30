const axios = require('axios');
const FeedParser = require('feedparser');
const config = require('../config');

class FeedProcessor {
  constructor() {
    this.processedEntries = new Set(); // Track processed entries to avoid duplicates
  }

  /**
   * Fetch and parse an Atom feed from Kill the Newsletter!
   * @param {string} feedUrl - The Atom feed URL
   * @returns {Promise<Array>} Array of parsed feed entries
   */
  async fetchFeed(feedUrl) {
    try {
      console.log(`Fetching feed from: ${feedUrl}`);
      
      const response = await axios.get(feedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Distro-Newsletter-Mode/1.0'
        }
      });

      return new Promise((resolve, reject) => {
        const feedparser = new FeedParser({});
        const entries = [];

        feedparser.on('error', (error) => {
          console.error('Feed parsing error:', error);
          reject(error);
        });

        feedparser.on('readable', function() {
          let item;
          while (item = this.read()) {
            entries.push(item);
          }
        });

        feedparser.on('end', () => {
          console.log(`Parsed ${entries.length} entries from feed`);
          resolve(entries);
        });

        feedparser.write(response.data);
        feedparser.end();
      });
    } catch (error) {
      console.error(`Error fetching feed from ${feedUrl}:`, error.message);
      throw error;
    }
  }

  /**
   * Convert a feed entry to the required Distro JSON schema
   * @param {Object} entry - The feed entry object
   * @param {string} sourceName - The name of the newsletter source
   * @returns {Object} The formatted JSON payload
   */
  convertToDistroSchema(entry, sourceName) {
    // Clean and truncate content to prevent payload size issues
    let content = entry.description || entry.summary || '';
    
    // Remove ALL HTML tags and clean up the content
    content = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Remove extra whitespace
      .trim()
      .substring(0, 1500); // Shorter limit to be safe
    
    // Create a much shorter preview
    let preview = content.substring(0, 200);
    
    // Clean up the title
    let title = entry.title || 'Newsletter Article';
    title = title
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
      .substring(0, 100);

    // Clean up author name
    let authorName = entry.author || sourceName || 'Newsletter Author';
    if (typeof authorName === 'string') {
      authorName = authorName.replace(/<[^>]*>/g, '').trim();
    }

    return {
      user_info: {
        name: authorName
      },
      more_info_url: entry.link || entry.guid || '',
      source: sourceName || 'Newsletter',
      cost: 10,
      preview: preview,
      title: title,
      content: content
    };
  }

  /**
   * Send data to Distro API
   * @param {Object} data - The JSON payload to send
   * @returns {Promise<Object>} API response
   */
  async sendToDistro(data) {
    try {
      console.log(`\n📤 Sending to Distro API:`);
      console.log(`   Title: ${data.title}`);
      console.log(`   Source: ${data.source}`);
      console.log(`   Author: ${data.user_info.name}`);
      console.log(`   Preview: ${data.preview.substring(0, 100)}...`);
      console.log(`   URL: ${data.more_info_url}`);
      
      const response = await axios.post(config.distro.apiEndpoint, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.distro.apiKey}`,
          'X-API-Key': config.distro.apiKey
        },
        timeout: 10000
      });

      console.log(`✅ Successfully sent to Distro API: ${data.title}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending to Distro API:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Process a single feed and send entries to Distro
   * @param {string} feedUrl - The feed URL to process
   */
  async processFeed(feedUrl) {
    try {
      const entries = await this.fetchFeed(feedUrl);
      
      for (const entry of entries) {
        // Create a more robust unique identifier for this entry
        const entryId = `${entry.title}-${entry.pubDate}`;
        
        // Skip if we've already processed this entry
        if (this.processedEntries.has(entryId)) {
          console.log(`⏭️  Skipping duplicate: ${entry.title}`);
          continue;
        }

        // Extract the actual source from the entry (e.g., "Unchained", "TechCrunch", etc.)
        let sourceName = 'Newsletter';
        if (entry.author) {
          sourceName = typeof entry.author === 'string' ? entry.author : entry.author.name || 'Newsletter';
        } else if (entry['dc:creator']) {
          sourceName = entry['dc:creator'];
        }

        // Convert to Distro schema with dynamic source
        const distroData = this.convertToDistroSchema(entry, sourceName);
        
        // Send to Distro API
        await this.sendToDistro(distroData);
        
        // Mark as processed
        this.processedEntries.add(entryId);
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing feed ${feedUrl}:`, error.message);
    }
  }

  /**
   * Process all configured feeds
   */
  async processAllFeeds() {
    console.log('Starting feed processing...');
    
    // Configured Kill the Newsletter! feeds
    const feeds = [
      'https://kill-the-newsletter.com/feeds/5nyovrh2i2cn9136lz54.xml'
      // Add more feed URLs here as needed
    ];

    for (const feedUrl of feeds) {
      await this.processFeed(feedUrl);
    }
    
    console.log('Feed processing completed');
  }
}

module.exports = FeedProcessor; 
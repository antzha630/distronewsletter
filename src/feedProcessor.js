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
      console.log(`\n🔍 Fetching feed from: ${feedUrl}`);
      
      const response = await axios.get(feedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Distro-Newsletter-Mode/1.0'
        }
      });

      console.log(`✅ Feed response received (${response.data.length} characters)`);

      return new Promise((resolve, reject) => {
        const feedparser = new FeedParser({});
        const entries = [];

        feedparser.on('error', (error) => {
          console.error('❌ Feed parsing error:', error);
          reject(error);
        });

        feedparser.on('readable', function() {
          let item;
          while (item = this.read()) {
            console.log(`📄 Found entry: "${item.title}" (${item.pubDate})`);
            entries.push(item);
          }
        });

        feedparser.on('end', () => {
          console.log(`✅ Parsed ${entries.length} entries from feed`);
          resolve(entries);
        });

        feedparser.write(response.data);
        feedparser.end();
      });
    } catch (error) {
      console.error(`❌ Error fetching feed from ${feedUrl}:`, error.message);
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
    // Extract author name from various possible fields
    let authorName = 'Unknown Author';
    if (entry.author) {
      authorName = typeof entry.author === 'string' ? entry.author : entry.author.name || 'Unknown Author';
    } else if (entry['dc:creator']) {
      authorName = entry['dc:creator'];
    }

    // Extract content, preferring summary if content is too long
    let content = entry.description || entry.summary || '';
    if (entry.content && entry.content.length > 0) {
      const fullContent = entry.content[0];
      if (fullContent && fullContent['#']) {
        content = fullContent['#'];
      }
    }

    // Clean HTML content to prevent rendering errors
    const cleanHtmlContent = (html) => {
      if (!html) return '';
      
      // Remove problematic HTML attributes and tags
      return html
        .replace(/class="[^"]*"/g, '') // Remove class attributes
        .replace(/style="[^"]*"/g, '') // Remove style attributes
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
        .replace(/<tdclass=/g, '<td class=') // Fix malformed td tags
        .replace(/<divclass=/g, '<div class=') // Fix malformed div tags
        .replace(/<spanclass=/g, '<span class=') // Fix malformed span tags
        .replace(/<pclass=/g, '<p class=') // Fix malformed p tags
        .replace(/<h[1-6]class=/g, (match) => match.replace('class=', ' class=')) // Fix malformed heading tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    };

    // Clean the content
    content = cleanHtmlContent(content);

    // Limit content size to prevent PayloadTooLargeError (max 50KB)
    const maxContentLength = 50000;
    if (content.length > maxContentLength) {
      console.log(`📏 Content too large (${content.length} chars), truncating to ${maxContentLength} chars`);
      content = content.substring(0, maxContentLength) + '... [Content truncated due to size limits]';
    }

    // Create preview (first 200 characters of content, also cleaned)
    let preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
    preview = cleanHtmlContent(preview);

    // Extract source link
    const moreInfoUrl = entry.link || entry.guid || '';

    return {
      user_info: {
        name: authorName
      },
      more_info_url: moreInfoUrl,
      source: sourceName,
      cost: 10, // Default cost as specified
      preview: preview,
      title: entry.title || 'Untitled',
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
      console.log(`\n🚀 Processing feed: ${feedUrl}`);
      const entries = await this.fetchFeed(feedUrl);
      
      console.log(`📊 Processing ${entries.length} entries...`);
      let processedCount = 0;
      let skippedCount = 0;
      
      for (const entry of entries) {
        // Create a unique identifier for this entry (more reliable)
        const entryId = `${entry.title}-${entry.pubDate}`;
        
        // Skip if we've already processed this entry
        if (this.processedEntries.has(entryId)) {
          console.log(`⏭️  Skipping already processed: "${entry.title}"`);
          skippedCount++;
          continue;
        }

        console.log(`\n📝 Processing entry: "${entry.title}"`);

        // Extract the actual source from the entry (e.g., "Unchained", "TechCrunch", etc.)
        let sourceName = 'Newsletter';
        if (entry.author) {
          sourceName = typeof entry.author === 'string' ? entry.author : entry.author.name || 'Newsletter';
        } else if (entry['dc:creator']) {
          sourceName = entry['dc:creator'];
        }
        
        console.log(`📰 Source: ${sourceName}`);

        // Convert to Distro schema with dynamic source
        const distroData = this.convertToDistroSchema(entry, sourceName);
        
        console.log(`🔄 Converted to Distro schema`);
        
        // Send to Distro API
        await this.sendToDistro(distroData);
        
        // Mark as processed
        this.processedEntries.add(entryId);
        processedCount++;
        
        console.log(`✅ Successfully processed: "${entry.title}"`);
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`\n📈 Feed processing summary:`);
      console.log(`   ✅ Processed: ${processedCount} entries`);
      console.log(`   ⏭️  Skipped: ${skippedCount} entries`);
      console.log(`   📊 Total: ${entries.length} entries`);
      
    } catch (error) {
      console.error(`❌ Error processing feed ${feedUrl}:`, error.message);
    }
  }

  /**
   * Process all configured feeds
   */
  async processAllFeeds() {
    console.log('\n🎯 Starting feed processing...');
    
    // Configured Kill the Newsletter! feeds
    const feeds = [
      'https://kill-the-newsletter.com/feeds/5nyovrh2i2cn9136lz54.xml'
      // Add more feed URLs here as needed
    ];
    
    console.log(`📋 Configured feeds: ${feeds.length}`);

    for (let i = 0; i < feeds.length; i++) {
      const feedUrl = feeds[i];
      console.log(`\n📡 Processing feed ${i + 1}/${feeds.length}: ${feedUrl}`);
      await this.processFeed(feedUrl);
    }
    
    console.log('\n🎉 Feed processing completed!');
  }
}

module.exports = FeedProcessor; 
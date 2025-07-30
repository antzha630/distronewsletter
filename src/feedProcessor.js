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
    // Debug: Log what we're getting from the feed
    console.log(`\n🔍 Processing entry:`);
    console.log(`   Title: ${entry.title}`);
    console.log(`   Description length: ${(entry.description || '').length}`);
    console.log(`   Summary length: ${(entry.summary || '').length}`);

    // Get the raw content
    let content = entry.description || entry.summary || '';
    
    // First, remove ALL HTML tags completely
    content = content.replace(/<[^>]*>/g, '');
    
    // Remove HTML entities
    content = content
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Remove the title from the beginning if it's there
    const entryTitle = entry.title || 'Newsletter Article';
    if (content.startsWith(entryTitle)) {
      content = content.substring(entryTitle.length).trim();
    }

    // Find the actual newsletter content by looking for meaningful text
    // Split into lines and find the first substantial paragraph
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let articleContent = '';
    let foundArticle = false;
    
    for (const line of lines) {
      // Skip CSS and technical content
      if (line.includes('{') || line.includes('}') || line.includes('!important') || 
          line.includes('color-scheme') || line.includes('webkit') || line.includes('ms-') ||
          line.includes('mso-') || line.includes('background-color') || line.includes('text-decoration') ||
          line.includes('font-size') || line.includes('margin') || line.includes('padding') ||
          line.includes('border') || line.includes('width') || line.includes('height')) {
        continue;
      }
      
      // Skip very short lines or technical content
      if (line.length < 20 || line.includes('px') || line.includes('em') || line.includes('rem') ||
          line.includes('rgb') || line.includes('rgba') || line.includes('#')) {
        continue;
      }
      
      // If we find a line that looks like actual content, start collecting
      if (line.length > 30 && !line.includes('{') && !line.includes('}') && 
          !line.includes('!important') && !line.includes('webkit') && !line.includes('ms-')) {
        foundArticle = true;
        articleContent += line + ' ';
      } else if (foundArticle && line.length > 10 && 
                 !line.includes('{') && !line.includes('}') && 
                 !line.includes('!important') && !line.includes('webkit')) {
        // Continue adding content
        articleContent += line + ' ';
      }
    }
    
    // If we didn't find good content, try a different approach
    if (!foundArticle || articleContent.length < 50) {
      // Look for content after common newsletter patterns
      const patterns = [
        /You're almost signed up/,
        /Click this big button/,
        /There are so many bots/,
        /Got a tip/,
        /Want to advertise/,
        /Unsubscribe/,
        /Privacy Policy/,
        /Copyright/,
        /Kill the Newsletter/,
        /View this email online/
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          const startIndex = content.indexOf(match[0]);
          if (startIndex > 0) {
            articleContent = content.substring(0, startIndex).trim();
            break;
          }
        }
      }
    }
    
    // Clean up the final content
    articleContent = articleContent
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1500);
    
    // If we still don't have good content, use a fallback
    if (articleContent.length < 50) {
      articleContent = 'Newsletter content is available. Please visit the original link to read the full article.';
    }

    // Create a shorter preview
    let preview = articleContent.substring(0, 200);
    
    // Clean up the title
    let title = entry.title || 'Newsletter Article';
    title = title.replace(/<[^>]*>/g, '').substring(0, 200);

    // Extract author name
    let authorName = sourceName || 'Newsletter Author';
    if (entry.author) {
      if (typeof entry.author === 'string') {
        authorName = entry.author;
      } else if (entry.author.name) {
        authorName = entry.author.name;
      }
    }

    console.log(`   Clean title: ${title}`);
    console.log(`   Clean content preview: ${articleContent.substring(0, 100)}...`);

    return {
      user_info: {
        name: authorName
      },
      more_info_url: entry.link || entry.guid || '',
      source: sourceName || 'Newsletter',
      cost: 10,
      preview: preview,
      title: title,
      content: articleContent
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
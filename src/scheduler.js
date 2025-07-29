const cron = require('node-cron');
const FeedProcessor = require('./feedProcessor');
const config = require('../config');

class Scheduler {
  constructor() {
    this.feedProcessor = new FeedProcessor();
    this.job = null;
  }

  /**
   * Start the scheduled feed processing
   */
  start() {
    console.log(`Starting scheduler with cron pattern: ${config.cron.schedule}`);
    
    this.job = cron.schedule(config.cron.schedule, async () => {
      console.log('Running scheduled feed processing...');
      try {
        await this.feedProcessor.processAllFeeds();
      } catch (error) {
        console.error('Error in scheduled feed processing:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('Scheduler started successfully');
  }

  /**
   * Stop the scheduled feed processing
   */
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('Scheduler stopped');
    }
  }

  /**
   * Run feed processing immediately (for testing)
   */
  async runNow() {
    console.log('Running feed processing immediately...');
    try {
      await this.feedProcessor.processAllFeeds();
    } catch (error) {
      console.error('Error in immediate feed processing:', error);
    }
  }
}

module.exports = Scheduler; 
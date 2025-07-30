require('dotenv').config();

module.exports = {
  distro: {
    apiKey: process.env.DISTRO_API_KEY || 'YjBBLiyW7bMAwyOoXpmTOQSjWbbgmec0qz8n6xOwJD3Eh9hCTwGVPk6te1ivVUtU',
    apiEndpoint: process.env.DISTRO_API_ENDPOINT || 'https://pulse-chain-dc452eb2642a.herokuapp.com/api/external/news'
  },
  app: {
    port: process.env.PORT || 3000,
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  feeds: {
    // Add your Kill the Newsletter! feed URLs here
    killTheNewsletterFeeds: process.env.KILL_THE_NEWSLETTER_FEEDS ? 
      process.env.KILL_THE_NEWSLETTER_FEEDS.split(',') : []
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || '*/5 * * * *' // Every 5 minutes
  }
}; 
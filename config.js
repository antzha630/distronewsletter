require('dotenv').config();

module.exports = {
  distro: {
    apiKey: process.env.DISTRO_API_KEY || '',
    apiEndpoint: process.env.DISTRO_API_ENDPOINT || ''
  },
  app: {
    port: process.env.PORT || 3000,
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  feeds: {
    killTheNewsletterFeeds: process.env.KILL_THE_NEWSLETTER_FEEDS ?
      process.env.KILL_THE_NEWSLETTER_FEEDS.split(',') : []
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || '*/5 * * * *' // Every 5 minutes
  }
}; 
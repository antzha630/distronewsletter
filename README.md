# Distro Newsletter Mode

A proof-of-concept application that converts email newsletters into Atom feeds using [Kill the Newsletter!](https://kill-the-newsletter.com/) and then processes them into a JSON format for the Distro platform.

## 🚀 Live Demo

**CEO Test URL**: [https://distro-newsletter-mode.vercel.app](https://distro-newsletter-mode.vercel.app)

## Overview

This application bridges the gap between email newsletters and the Distro platform by:

1. **Fetching Atom feeds** from Kill the Newsletter! (which converts email newsletters to RSS/Atom feeds)
2. **Parsing feed entries** and converting them to the required Distro JSON schema
3. **Sending processed data** to the Distro API endpoint
4. **Scheduling regular processing** using cron jobs

## Features

- 🔄 **Automated Processing**: Runs on a configurable schedule (default: every 5 minutes)
- 🌐 **Web Interface**: Simple web UI for manual feed processing and testing
- 📊 **Duplicate Prevention**: Tracks processed entries to avoid duplicates
- 🔧 **Configurable**: Easy configuration through environment variables
- 📝 **Logging**: Comprehensive logging for monitoring and debugging

## JSON Schema

The application converts newsletter entries into the following JSON format:

```json
{
  "user_info": {
    "name": "Author Name"
  },
  "more_info_url": "Link of the Source",
  "source": "Name of the source",
  "cost": 10,
  "preview": "Content of the preview",
  "title": "Title of the news",
  "content": "Content of the news"
}
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd distronewsletter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the application**
   
   Create a `.env` file in the root directory:
   ```bash
   # Distro API Configuration
   DISTRO_API_KEY=your_api_key_here
   DISTRO_API_ENDPOINT=your_api_endpoint_here
   
   # App Configuration
   PORT=3000
   LOG_LEVEL=info
   
   # Kill the Newsletter! Configuration
   # Add your Kill the Newsletter! feed URLs here (comma-separated)
   KILL_THE_NEWSLETTER_FEEDS=
   
   # Cron schedule for checking feeds (every 5 minutes)
   CRON_SCHEDULE=*/5 * * * *
   ```

4. **Start the application**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### Quick Deploy

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Follow the prompts** and your app will be live!

### Manual Deploy

1. **Push to GitHub**
2. **Connect to Vercel** from the dashboard
3. **Import your repository**
4. **Set environment variables** in Vercel dashboard:
   - `DISTRO_API_KEY`: Your Distro API key
   - `DISTRO_API_ENDPOINT`: Your Distro API endpoint
5. **Deploy automatically**

## Usage

### Web Interface

Once the application is running, visit the web interface to:

- **Test feed processing manually** - Click "Process Newsletters Now"
- **Test individual feeds** - Add a Kill the Newsletter! feed URL and source name
- **Monitor the application status**

### API Endpoints

- `GET /` - Web interface
- `POST /api/process-feeds` - Run feed processing manually
- `POST /api/process-single-feed` - Process a single feed
- `GET /api/status` - Get application status

### Adding Newsletter Feeds

1. **Set up Kill the Newsletter!**:
   - Go to [kill-the-newsletter.com](https://kill-the-newsletter.com/)
   - Sign up for the newsletters you want to convert
   - Get the Atom feed URL for each newsletter

2. **Configure feeds in the application**:
   
   Edit `src/feedProcessor.js` and add your feeds to the `processAllFeeds()` method:
   ```javascript
   const feeds = [
     { 
       url: 'https://kill-the-newsletter.com/feeds/your-feed-id.xml', 
       source: 'Your Newsletter Name' 
     },
     // Add more feeds here
   ];
   ```

### Kill the Newsletter! Setup

As mentioned in the documentation, you can use the workaround approach:

1. **Sign up for newsletters** using your regular email address
2. **Set up email forwarding** to forward newsletter emails to Kill the Newsletter!
3. **Get the Atom feed URL** from Kill the Newsletter!
4. **Add the feed URL** to your application configuration

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DISTRO_API_KEY` | Your Distro API key | (required) |
| `DISTRO_API_ENDPOINT` | Distro API endpoint | (required) |
| `PORT` | Application port | `3000` |
| `LOG_LEVEL` | Logging level | `info` |
| `CRON_SCHEDULE` | Cron schedule for processing | `*/5 * * * *` (every 5 minutes) |

### Cron Schedule Examples

- `*/5 * * * *` - Every 5 minutes
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 */2 * * *` - Every 2 hours

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Email Newsletter│───▶│ Kill the         │───▶│ Distro          │
│                 │    │ Newsletter!      │    │ Newsletter Mode │
└─────────────────┘    │ (Atom Feed)      │    │                 │
                       └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Distro API      │
                                               │ (JSON Payload)  │
                                               └─────────────────┘
```

## Troubleshooting

### Common Issues

1. **Feed parsing errors**: Check that the feed URL is valid and accessible
2. **API connection errors**: Verify your API key and endpoint URL
3. **Duplicate entries**: The application tracks processed entries to avoid duplicates
4. **Scheduler not running**: Check the cron schedule configuration

### Logs

The application provides detailed logging. Check the console output for:
- Feed fetching status
- API request/response details
- Error messages and stack traces

## Development

### Project Structure

```
distronewsletter/
├── src/
│   ├── feedProcessor.js    # Core feed processing logic
│   └── scheduler.js        # Cron job scheduler
├── config.js              # Configuration management
├── index.js               # Main application entry point
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment config
└── README.md             # This file
```

### Adding Features

- **New feed sources**: Extend the `FeedProcessor` class
- **Different output formats**: Modify the `convertToDistroSchema` method
- **Additional scheduling**: Update the `Scheduler` class

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please refer to the project documentation or create an issue in the repository. 
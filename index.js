const express = require('express');
const Scheduler = require('./src/scheduler');
const FeedProcessor = require('./src/feedProcessor');
const config = require('./config');

const app = express();
const scheduler = new Scheduler();
const feedProcessor = new FeedProcessor();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Distro Newsletter Mode</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 60px;
          color: white;
        }
        
        .header h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 16px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .card-icon {
          width: 24px;
          height: 24px;
          background: #667eea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          margin-bottom: 16px;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn:active {
          transform: translateY(0);
        }
        
        .btn-secondary {
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }
        
        .btn-secondary:hover {
          background: #edf2f7;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .status {
          padding: 16px;
          border-radius: 12px;
          margin-top: 16px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .status.success {
          background: #f0fff4;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }
        
        .status.error {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }
        
        .status.processing {
          background: #ebf8ff;
          color: #2a4365;
          border: 1px solid #90cdf4;
        }
        
        .status-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status.success .status-icon {
          background: #48bb78;
          color: white;
        }
        
        .status.error .status-icon {
          background: #f56565;
          color: white;
        }
        
        .status.processing .status-icon {
          background: #4299e1;
          color: white;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #4a5568;
        }
        
        .form-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          background: #f7fafc;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        
        .stat-card {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          color: white;
          backdrop-filter: blur(10px);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .footer {
          text-align: center;
          margin-top: 60px;
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
          }
          
          .dashboard {
            grid-template-columns: 1fr;
          }
          
          .container {
            padding: 20px 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Distro Newsletter Mode</h1>
          <p>Automatically convert email newsletters into engaging headlines and stories for your Distro platform</p>
        </div>
        
        <div class="dashboard">
          <div class="card">
            <h2>
              <span class="card-icon">⚙️</span>
              API Configuration
            </h2>
            <p style="margin-bottom: 20px; color: #718096; line-height: 1.6;">
              Configure your Distro API settings. These will be used for all newsletter processing.
            </p>
            <div class="form-group">
              <label for="apiEndpoint">Distro API Endpoint</label>
              <input type="text" id="apiEndpoint" class="form-input" placeholder="https://your-api-endpoint.com/api/external/news" value="${config.distro.apiEndpoint}" />
            </div>
            <div class="form-group">
              <label for="apiKey">API Key</label>
              <input type="password" id="apiKey" class="form-input" placeholder="Your API key" value="${config.distro.apiKey}" />
            </div>
            <button class="btn btn-secondary" onclick="saveConfig()">
              Save Configuration
            </button>
            <div id="configStatus"></div>
          </div>
          
          <div class="card">
            <h2>
              <span class="card-icon">⚡</span>
              Quick Processing
            </h2>
            <p style="margin-bottom: 20px; color: #718096; line-height: 1.6;">
              Process all configured newsletter feeds immediately. This will check for new content and send it to your Distro platform.
            </p>
            <button class="btn" onclick="runProcessing()">
              Process Newsletters Now
            </button>
            <div id="status"></div>
          </div>
          
          <div class="card">
            <h2>
              <span class="card-icon">🔧</span>
              Test Individual Feed
            </h2>
            <p style="margin-bottom: 20px; color: #718096; line-height: 1.6;">
              Test a specific newsletter feed to see how it gets converted and sent to Distro.
            </p>
            <div class="form-group">
              <label for="feedUrl">Newsletter Feed URL</label>
              <input type="text" id="feedUrl" class="form-input" placeholder="https://kill-the-newsletter.com/feeds/..." />
            </div>
            <div class="form-group">
              <label for="sourceName">Newsletter Name</label>
              <input type="text" id="sourceName" class="form-input" placeholder="e.g., TechCrunch, Unchained" />
            </div>
            <button class="btn btn-secondary" onclick="processSingleFeed()">
              Test This Feed
            </button>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">5</div>
            <div class="stat-label">Minutes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Monitoring</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">Auto</div>
            <div class="stat-label">Processing</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Distro Newsletter Mode • Automatically converting newsletters to headlines</p>
        </div>
      </div>
      
      <script>
        async function runProcessing() {
          const statusDiv = document.getElementById('status');
          statusDiv.innerHTML = '<div class="status processing"><span class="status-icon">⏳</span>Processing newsletters...</div>';
          
          try {
            const response = await fetch('/api/process-feeds', { method: 'POST' });
            const result = await response.json();
            
            if (response.ok) {
              statusDiv.innerHTML = '<div class="status success"><span class="status-icon">✅</span>Newsletters processed successfully!</div>';
            } else {
              statusDiv.innerHTML = '<div class="status error"><span class="status-icon">❌</span>Error: ' + result.error + '</div>';
            }
          } catch (error) {
            statusDiv.innerHTML = '<div class="status error"><span class="status-icon">❌</span>Error: ' + error.message + '</div>';
          }
        }
        
        async function saveConfig() {
          const apiEndpoint = document.getElementById('apiEndpoint').value;
          const apiKey = document.getElementById('apiKey').value;
          
          if (!apiEndpoint || !apiKey) {
            alert('Please provide both API endpoint and API key');
            return;
          }
          
          const statusDiv = document.getElementById('configStatus');
          statusDiv.innerHTML = '<div class="status processing"><span class="status-icon">⏳</span>Saving configuration...</div>';
          
          try {
            const response = await fetch('/api/save-config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ apiEndpoint, apiKey })
            });
            const result = await response.json();
            
            if (response.ok) {
              statusDiv.innerHTML = '<div class="status success"><span class="status-icon">✅</span>Configuration saved successfully!</div>';
            } else {
              statusDiv.innerHTML = '<div class="status error"><span class="status-icon">❌</span>Error: ' + result.error + '</div>';
            }
          } catch (error) {
            statusDiv.innerHTML = '<div class="status error"><span class="status-icon">❌</span>Error: ' + error.message + '</div>';
          }
        }
        
        async function processSingleFeed() {
          const feedUrl = document.getElementById('feedUrl').value;
          const sourceName = document.getElementById('sourceName').value;
          
          if (!feedUrl || !sourceName) {
            alert('Please provide both feed URL and newsletter name');
            return;
          }
          
          const statusDiv = document.getElementById('status');
          statusDiv.innerHTML = '<div class="status processing"><span class="status-icon">⏳</span>Testing feed...</div>';
          
          try {
            const response = await fetch('/api/process-single-feed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ feedUrl, sourceName })
            });
            const result = await response.json();
            
            if (response.ok) {
              statusDiv.innerHTML = '<div class="status success"><span class="status-icon">✅</span>Feed tested successfully!</div>';
            } else {
              statusDiv.innerHTML = '<div class="status error"><span class="status-icon">❌</span>Error: ' + result.error + '</div>';
            }
          } catch (error) {
            statusDiv.innerHTML = '<div class="status error"><span class="status-icon">❌</span>Error: ' + error.message + '</div>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API Routes
app.post('/api/process-feeds', async (req, res) => {
  try {
    await scheduler.runNow();
    res.json({ success: true, message: 'Feed processing completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save-config', async (req, res) => {
  try {
    const { apiEndpoint, apiKey } = req.body;
    
    if (!apiEndpoint || !apiKey) {
      return res.status(400).json({ error: 'API endpoint and API key are required' });
    }
    
    // Update the config in memory
    config.distro.apiEndpoint = apiEndpoint;
    config.distro.apiKey = apiKey;
    
    res.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/process-single-feed', async (req, res) => {
  try {
    const { feedUrl, sourceName } = req.body;
    
    if (!feedUrl || !sourceName) {
      return res.status(400).json({ error: 'Feed URL and source name are required' });
    }
    
    await feedProcessor.processFeed(feedUrl, sourceName);
    res.json({ success: true, message: 'Single feed processed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    config: {
      apiEndpoint: config.distro.apiEndpoint,
      cronSchedule: config.cron.schedule
    }
  });
});

// Start the application
const PORT = config.app.port;

app.listen(PORT, () => {
  console.log(`Distro Newsletter Mode server running on port ${PORT}`);
  console.log(`Web interface available at: http://localhost:${PORT}`);
  console.log(`API endpoint: ${config.distro.apiEndpoint}`);
  console.log(`Cron schedule: ${config.cron.schedule}`);
  
  // Start the scheduler
  scheduler.start();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  scheduler.stop();
  process.exit(0);
}); 
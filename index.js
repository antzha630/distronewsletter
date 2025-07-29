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
    <html lang="en">
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }
        
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        
        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
        
        .card h2 {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          color: #2d3748;
          font-size: 1.5rem;
        }
        
        .card-icon {
          margin-right: 0.5rem;
          font-size: 1.8rem;
        }
        
        .card p {
          color: #718096;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;
        }
        
        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #718096;
          font-weight: 600;
        }
        
        .footer {
          text-align: center;
          color: white;
          opacity: 0.8;
        }
        
        #status {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
        }
        
        .status-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .status-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .status-info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        
        .monitoring {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }
        
        .monitoring h2 {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          color: #2d3748;
          font-size: 1.5rem;
        }
        
        .log-entry {
          background: #f7fafc;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
        }
        
        .log-success { color: #38a169; }
        .log-error { color: #e53e3e; }
        .log-info { color: #3182ce; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Distro Newsletter Mode</h1>
          <p>Automatically convert email newsletters into engaging headlines and stories for your Distro platform</p>
        </div>

        <div class="monitoring">
          <h2><span class="card-icon">📊</span>Live Monitoring</h2>
          <p>Track real-time processing and see when new articles are discovered and sent to Distro.</p>
          <div id="monitoring-logs">
            <div class="log-entry log-info">Ready to monitor newsletter processing...</div>
          </div>
        </div>

        <div class="dashboard">
          <div class="card">
            <h2><span class="card-icon">⚡</span>Quick Processing</h2>
            <p>Process all configured newsletter feeds immediately and see new articles in real-time.</p>
            <button class="btn" onclick="runProcessing()">Process Newsletters Now</button>
            <div id="status"></div>
          </div>

          <div class="card">
            <h2><span class="card-icon">🔧</span>Test Individual Feed</h2>
            <p>Test a specific newsletter feed to see how it gets converted and sent to Distro.</p>
            <div class="form-group">
              <label for="feedUrl">Newsletter Feed URL</label>
              <input type="text" id="feedUrl" class="form-input" placeholder="https://kill-the-newsletter.com/feeds/..." />
            </div>
            <div class="form-group">
              <label for="sourceName">Newsletter Name</label>
              <input type="text" id="sourceName" class="form-input" placeholder="e.g., TechCrunch, Unchained" />
            </div>
            <button class="btn btn-secondary" onclick="processSingleFeed()">Test This Feed</button>
          </div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-number" id="articles-processed">0</div>
            <div class="stat-label">Articles Processed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="last-processed">-</div>
            <div class="stat-label">Last Processed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="success-rate">0%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>

        <div class="footer">
          <p>Distro Newsletter Mode • Automatically converting newsletters to headlines</p>
        </div>
      </div>

      <script>
        let processingCount = 0;
        let successCount = 0;
        
        function addLog(message, type = 'info') {
          const logs = document.getElementById('monitoring-logs');
          const logEntry = document.createElement('div');
          logEntry.className = \`log-entry log-\${type}\`;
          logEntry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
          logs.insertBefore(logEntry, logs.firstChild);
          
          // Keep only last 10 logs
          while (logs.children.length > 10) {
            logs.removeChild(logs.lastChild);
          }
        }
        
        function updateStats() {
          document.getElementById('articles-processed').textContent = processingCount;
          document.getElementById('last-processed').textContent = new Date().toLocaleTimeString();
          document.getElementById('success-rate').textContent = processingCount > 0 ? Math.round((successCount / processingCount) * 100) + '%' : '0%';
        }
        
        async function runProcessing() {
          const statusDiv = document.getElementById('status');
          statusDiv.innerHTML = '<div class="status-info">Processing newsletters...</div>';
          
          addLog('Starting manual newsletter processing...', 'info');
          
          try {
            const response = await fetch('/api/process-feeds', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            const result = await response.json();
            
            if (response.ok) {
              statusDiv.innerHTML = '<div class="status-success">Feed processing completed successfully!</div>';
              addLog(\`Successfully processed feeds. Found \${result.processed || 0} new articles.\`, 'success');
              processingCount += result.processed || 0;
              successCount += result.processed || 0;
            } else {
              statusDiv.innerHTML = '<div class="status-error">Error processing feeds</div>';
              addLog(\`Error processing feeds: \${result.error}\`, 'error');
            }
          } catch (error) {
            statusDiv.innerHTML = '<div class="status-error">Network error</div>';
            addLog(\`Network error: \${error.message}\`, 'error');
          }
          
          updateStats();
        }
        
        async function processSingleFeed() {
          const feedUrl = document.getElementById('feedUrl').value;
          const sourceName = document.getElementById('sourceName').value;
          
          if (!feedUrl) {
            alert('Please enter a feed URL');
            return;
          }
          
          const statusDiv = document.getElementById('status');
          statusDiv.innerHTML = '<div class="status-info">Processing single feed...</div>';
          
          addLog(\`Testing individual feed: \${sourceName || 'Unknown'}\`, 'info');
          
          try {
            const response = await fetch('/api/process-single-feed', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                feedUrl: feedUrl,
                sourceName: sourceName || 'Test Newsletter'
              })
            });
            
            const result = await response.json();
            
            if (response.ok) {
              statusDiv.innerHTML = '<div class="status-success">Single feed processed successfully!</div>';
              addLog(\`Successfully processed single feed. Found \${result.processed || 0} articles.\`, 'success');
              processingCount += result.processed || 0;
              successCount += result.processed || 0;
            } else {
              statusDiv.innerHTML = '<div class="status-error">Error processing single feed</div>';
              addLog(\`Error processing single feed: \${result.error}\`, 'error');
            }
          } catch (error) {
            statusDiv.innerHTML = '<div class="status-error">Network error</div>';
            addLog(\`Network error: \${error.message}\`, 'error');
          }
          
          updateStats();
        }
        
        // Auto-refresh monitoring every 30 seconds
        setInterval(() => {
          fetch('/api/status')
            .then(response => response.json())
            .then(data => {
              if (data.lastProcessed) {
                addLog(\`Last automated run: \${data.lastProcessed}\`, 'info');
              }
            })
            .catch(error => {
              addLog(\`Status check error: \${error.message}\`, 'error');
            });
        }, 30000);
      </script>
    </body>
    </html>
  `);
});

// API Routes
app.post('/api/process-feeds', async (req, res) => {
  try {
    console.log('Manual feed processing triggered via API');
    await scheduler.runNow();
    res.json({ 
      success: true, 
      message: 'Feed processing completed',
      processed: 1, // This will be updated with actual count
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual feed processing:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/process-single-feed', async (req, res) => {
  try {
    const { feedUrl, sourceName } = req.body;
    
    if (!feedUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Feed URL is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Processing single feed: ${feedUrl}`);
    const processor = new FeedProcessor();
    await processor.processFeed(feedUrl);
    
    res.json({ 
      success: true, 
      message: 'Single feed processed successfully',
      processed: 1, // This will be updated with actual count
      feedUrl,
      sourceName: sourceName || 'Unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing single feed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    lastProcessed: new Date().toISOString(),
    scheduler: scheduler.job ? 'active' : 'inactive',
    timestamp: new Date().toISOString()
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
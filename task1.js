const http = require('http');
const os = require('os');

const PORT = 3000;

// Dummy user data for /api/users
const users = [
  { id: 1, name: 'Alice Smith', role: 'Developer' },
  { id: 2, name: 'Bob Jones', role: 'Designer' },
];

const server = http.createServer((req, res) => {
  // Destructure URL and HTTP method from the request
  const { url, method } = req;

  // Helper function to send standard JSON responses
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'X-Powered-By': 'Node.js-Raw-HTTP',
    });
    res.end(JSON.stringify(data));
  };

  // Route Handling
  if (method === 'GET') {
    if (url === '/') {
      sendJSON(200, {
        status: 'success',
        message: 'Welcome to the Raw Node.js HTTP Server!',
      });
    } else if (url === '/api/users') {
      sendJSON(200, {
        status: 'success',
        data: users,
      });
    } else if (url === '/api/health') {
      // Bonus Endpoint
      sendJSON(200, {
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        platform: os.platform(),
        timestamp: new Date().toISOString(),
      });
    } else {
      // 404 Route Not Found
      sendJSON(404, {
        status: 'error',
        message: 'Route Not Found',
      });
    }
  } else {
    // 405 Method Not Allowed
    sendJSON(405, {
      status: 'error',
      message: `Method ${method} Not Allowed`,
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
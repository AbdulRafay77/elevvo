const http = require('http');

// Create the server
const server = http.createServer((req, res) => {
  // Every time a client makes a request, this function runs
  console.log(`Recieved a request for: ${req.url}`);

  // Tell the server to listen on port 3000
  res.statusCode = 200;
  res.setHeader = ('Content-Types', 'text/plain');
  res.end('Hello from Elevvo Backend!');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})
const http = require('http');

const server = http.createServer((req, res) => {

  res.setHeader('Content-Type', 'application/json');


  if(req.url === '/' && req.method === 'GET'){
    res.statusCode = 200;
    res.end(JSON.stringify({ message: "Welcome to Elevvo API" }));
  }else if (req.url === '/api/users' && req.method === 'GET') {
    const users = [
      { id: 1, name: "Ali", role: "Developer" },
      { id: 1, name: "Sara", role: "Designer" }
    ];
    res.statusCode = 200;
    res.end(JSON.stringify(users));
  }else if (req.url === '/api/health' && req.method === 'GET'){
    const time = Date.now()
    const users = [
      { id: 1, name: "Ali", role: "Developer", health: "Healthy", time: time },
      { id: 2, name: "Sara", role: "Designer", health: "Sick", time: time }
    ];
    res.statusCode = 200;
    res.end(JSON.stringify(users));
  }else{

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(3000, () => console.log('Server active on port 3000'));
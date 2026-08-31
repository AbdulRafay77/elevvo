const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'jdsfc2873t47812g3ox87132xb';

app.use(helmet());

app.use(express.json());

// Bonus: Strict CORS domain origin filtering
const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, cURL, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation: Origin not allowed.'));
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Bonus: Strict Rate Limiter for /login (5 requests per 15-minute window)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. MOCK DATABASE & INITIAL SEEDING

const userDB = [];

const seedDatabase = async () => {
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  userDB.push(
    { id: 1, email: 'user@example.com', password: userPasswordHash, role: 'USER' },
    { id: 2, email: 'admin@example.com', password: adminPasswordHash, role: 'ADMIN' }
  );
  console.log('Database seeded with standard and admin users.');
};
seedDatabase();

// 3. AUTHENTICATION & AUTHORIZATION MIDDLEWARE

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }
    req.user = decodedUser; // Attach identity claims to request object
    next();
  });
};

// AuthZ Middleware: Restricts access based on user role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have permission to access this resource.',
      });
    }
    next();
  };
};

// 4. ROUTE DEFINITIONS

// Public Route: User Registration (Hashes password)
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password required.' });
  }

  const existingUser = usersDB.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ status: 'error', message: 'User already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: usersDB.length + 1,
    email,
    password: hashedPassword,
    role: role === 'ADMIN' ? 'ADMIN' : 'USER',
  };

  usersDB.push(newUser);
  res.status(201).json({ status: 'success', message: 'User registered successfully.' });
});

// Public Route: Authentication / Login (Applies Rate Limiter)
app.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  const user = usersDB.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
  }

  // Compare raw password against stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
  }

  // Issue signed JWT token containing claims (userId, email, role)
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    status: 'success',
    token,
  });
});

// Protected Route: Available to any authenticated user (USER or ADMIN)
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    message: `Hello ${req.user.email}, this is your profile data.`,
    user: req.user,
  });
});

// Protected Route: Restricted exclusively to ADMIN role
app.get('/api/admin/dashboard', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the Admin Dashboard. Sensitive operational metrics loaded.',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Security-hardened server running on http://localhost:${PORT}`);
});
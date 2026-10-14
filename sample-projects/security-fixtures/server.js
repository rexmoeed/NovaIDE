// Deliberately Vulnerable Server Fixture for Security Auditor Verification
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// 1. COMMITTED SECRETS (AWS, OpenAI, Google)
const AWS_KEY = 'AKIA1234567890ABCDEF';
const OPENAI_KEY = 'sk-proj-deliberate-vulnerable-key-token-1234567890abcdef1234567890';
const GOOGLE_KEY = 'AIzaSyD-DeliberatelyVulnerableKey123456';

// 2. INSECURE CORS WITH CREDENTIALS
app.use(cors({ origin: '*', credentials: true }));

// 3. DANGEROUS SHELL EXECUTION (COMMAND INJECTION)
app.post('/api/run-diagnostic', (req, res) => {
  const host = req.body.host;
  exec(`ping -c 1 ${host}`, (err, stdout) => {
    res.json({ output: stdout });
  });
});

// 4. PATH TRAVERSAL RISK
app.get('/api/view-report', (req, res) => {
  const file = req.query.filename;
  const filePath = path.join(__dirname, 'reports', file);
  fs.readFile(filePath, 'utf-8', (err, data) => {
    res.send(data);
  });
});

// 5. CODE INJECTION (eval)
app.post('/api/calculate', (req, res) => {
  const expr = req.body.expression;
  const result = eval(expr);
  res.json({ result });
});

// 6. SQL INJECTION CONCATENATION
app.get('/api/users/search', (req, res) => {
  const query = `SELECT * FROM users WHERE username = '${req.query.user}'`;
  res.json({ sql: query });
});

// 7. UNPROTECTED ADMINISTRATIVE ROUTE
app.post('/api/admin/purge-database', async (req, res) => {
  res.json({ status: 'database purged' });
});

// 8. HARDCODED CREDENTIAL CHECK
app.post('/api/login', (req, res) => {
  if (req.body.password === 'supersecretadmin123') {
    res.json({ auth: true });
  } else {
    res.status(401).json({ auth: false });
  }
});

// 9. DISABLED TLS VERIFICATION
const httpsAgent = {
  rejectUnauthorized: false
};

// 10. UNRESTRICTED PROCESS.ENV LOGGING
console.log(process.env);

app.listen(8080);

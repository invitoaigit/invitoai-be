const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}


const getLogFileName = () => {
  const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  return path.join(logsDir, `${date}.log`);
};

// Request Logger Middleware
const requestLogger = (req, res, next) => {
  const logStream = fs.createWriteStream(getLogFileName(), { flags: 'a' });
  morgan('combined', { stream: logStream })(req, res, () => {
    
    morgan('dev')(req, res, next); // Shorter format for console
  });
};

// Error Logger Middleware
const errorLogger = (err, req, res, next) => {
  const logStream = fs.createWriteStream(getLogFileName(), { flags: 'a' });
  const errorLog = `[${new Date().toISOString()}] Error: ${err.message} \nStack: ${err.stack}\n\n`;

  logStream.write(errorLog);
  logStream.end();

  // Pass error to the next middleware
  next(err);
};

module.exports = { requestLogger, errorLogger };

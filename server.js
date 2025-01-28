const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const configureServer = require('./config/serverConfig');
const apiRoutes = require('./routes/api');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const analyticsController = require("./controllers/analyticsController");
const cron = require("node-cron");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/upload');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invitationRoutes = require ('./routes/invitationRoutes')
const ticketRoutes = require ('./routes/ticketRoutes')
const templateRoutes = require ('./routes/templateRoutes')
const analyticsRoutes = require ('./routes/analyticsRoutes')
const crypto = require('crypto');



const path = require('path');

dotenv.config();

connectDB();

const app = express();

configureServer(app);

app.use(requestLogger);


app.use(express.static(path.join(__dirname, 'public')));

app.use('/invitations_data', express.static(path.join(__dirname, 'invitations_data')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


/* app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
 */
app.use('/api/v1', apiRoutes);
app.use('/api/v1', uploadRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/templates', templateRoutes);
app.post('/deploy', express.json({ limit: '10mb' }), (req, res) => {
  const payload = JSON.stringify(req.body);
  const sigHeader = req.headers['x-hub-signature-256']; 
  const secret = process.env.GITHUB_WEBHOOK_SECRET; 

  const hmac = crypto.createHmac('sha256', secret);
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;

  if (crypto.timingSafeEqual(Buffer.from(sigHeader || ''), Buffer.from(digest))) {
    console.log('✅ Webhook signature verified!');
    // Deploy logic (e.g., pulling the latest changes)
    const exec = require('child_process').exec;
    exec('git pull && npm install && pm2 restart all', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Deployment failed: ${error.message}`);
        return res.status(500).send('Deployment failed');
      }
      console.log(`🎉 Deployment successful:\n${stdout}`);
      res.status(200).send('Deployment successful');
    });
  } else {
    console.warn('❌ Webhook signature verification failed!');
    return res.status(401).send('Unauthorized');
  }
});

app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message); 
    errorLogger(err, req, res, next);              
    res.status(500).json({ error: 'Internal Server Error' });
});

cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Running daily analytics creation job...");
    await analyticsController.createDailyAnalytics();
  },
  {
    timezone: "America/Los_Angeles", 
  }
);





const runOnRestart = async () => {
  console.log("🚀 Server has restarted. Running immediate analytics creation job...");
  await analyticsController.createDailyAnalytics(); 
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  runOnRestart();
});

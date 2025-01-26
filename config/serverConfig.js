const cors = require('cors');
const express = require('express');

const configureServer = (app) => {
  const allowedOrigins = ['http://localhost:5173', 'https://invito.com', 'https://invitoai-fe.pages.dev'];

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
      
        callback(null, true);
      } else {
        const url = new URL(origin);
        const baseDomain = url.hostname.replace(/^[^.]+\./, ''); 

        if (
          allowedOrigins.includes(origin) || 
          allowedOrigins.some(allowedOrigin => allowedOrigin.includes(baseDomain))
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true, 
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  console.log('✅ Server Configured with CORS!');
};

module.exports = configureServer;

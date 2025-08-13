require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const ngrok = require('@ngrok/ngrok');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML Form

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Send SMS via Termux</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          background: #f7f7f7;
        }
        .container {
          max-width: 500px;
          margin-top: 50px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h3 class="mb-4 text-center">📱 Send SMS via Termux</h3>
        <form method="POST" action="/send-sms">
          <div class="mb-3">
            <label class="form-label">Mobile Number</label>
            <input type="text" name="mobile" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Message</label>
            <textarea name="message" class="form-control" rows="4" required></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">SIM Slot (default 0)</label>
            <input type="number" name="simSlot" class="form-control" value="0" min="0" max="1" />
          </div>
          <button type="submit" class="btn btn-primary w-100">Send SMS</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Handle form or JSON requests
app.post('/send-sms', (req, res) => {
  const { mobile, message, simSlot = 0 } = req.body;

  if (!mobile || !message) {
    return res.status(400).send('mobile and message are required');
  }

  const cmd = `termux-sms-send -s ${simSlot} -n ${mobile} "${message}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error:', stderr);
      return res.status(500).send('Failed to send SMS');
    }

    res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="text-center">
      <h4>✅ SMS sent to ${mobile}</h4>
      <a href="/" class="btn btn-outline-primary mt-3">Send another</a>
    </div>
  </body>
  </html>
`);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    const listener = await ngrok.connect({ addr: PORT, authtoken: process.env.NGROK_AUTHTOKEN });
    console.log(`🌐 Visit: ${listener.url()}`);
  } catch (err) {
    console.error(err.message);
  }
});

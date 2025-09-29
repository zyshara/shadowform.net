// index.js
import express from 'express';

const app = express();
const port = process.env.PORT || 3000 

// Define a route
app.get('/', (req, res) => {
  res.send('Under Construction 🌸');
});

app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

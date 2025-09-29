// index.js
import express from 'express';

const app = express();
const port = 3000;

// Define a route
app.get('/', (req, res) => {
  res.send('Under Construction 🌸');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

require('dotenv').config();
const port = process.env.PORT || 5000;
const express = require('express');
const cors = require('cors');

const app = express();

// Allow CORS
app.use(cors());
// Parse JSON
app.use(express.json({limit:'200mb'}));

// Start the server

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

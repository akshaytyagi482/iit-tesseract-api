const express = require('express');
const Routes = require('./routes/routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); // Parse incoming JSON requests
app.use('/api', Routes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
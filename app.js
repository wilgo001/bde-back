let express = require('express');
app = express();

let adminRoutes = require('./routes/adminRoutes');

app.use('/admin', adminLogRoutes);
const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const port = 5600;

const corsOptions = {
    origin: "http://localhost:3200"
}

const mongoDB = require('./utils/mongoUtils');
const tokenUtils = require("./utils/tokenUtils");

const adminRoutes = require('./routes/adminRoutes');
const adminLogRoutes = require('./routes/adminRoutes/adminLogRoutes');
const adminSweatRoutes = require('./routes/adminRoutes/adminSweatRoutes');
const adminSweatImageRoutes = require('./routes/adminRoutes/adminSweatImageRoutes');

const sweatRoutes = require('./routes/sweatRoutes');

const app = express();
app.use(cors(corsOptions));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.get('/', tokenUtils.printPath, async (req, res) => {
    const results = await members.find({}).toArray();
    res.send(results);
})

app.use('/admin', adminRoutes);
app.use('/admin/login', adminLogRoutes);
app.use('/admin/sweat', adminSweatRoutes);
app.use('/admin/sweat/image', adminSweatImageRoutes);

app.use('/sweat', sweatRoutes);

app.listen(port, async () => {
    mongoDB.connect();
    console.log(`Example app listening on port ${port} and connected to db ${mongoDB.dbName}`);
})
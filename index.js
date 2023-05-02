const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const { unlink } = require("node:fs");

const uri = "mongodb+srv://bde-admin:iVZopL8BVx10cNVp@cluster0.gcko9w8.mongodb.net/?retryWrites=true&w=majority";
const port = 5600;
const SECRET = 'mykey';
const dbName = "bde-esra-bretagne";
const collectionsName = {
    members: "membersTest",
    adminLog: "adminLog",
}
const corsOptions = {
    origin: "http://localhost:3200"
}
let db;

/////COLLECTIONS/////
let members;
let adminLog;
let sweat;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();
app.use(cors(corsOptions));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

////////////////////////SETUP FILE STORAGE////////////////////////
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(req.path === "/admin/image" && req.body.id) {
            cb(null, `/static/sweat/${req.body.id}`);
        }
    },
    filename: (req, file, cb ) => {
        if(req.path === "/admin/image" && req.body.id) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix);
        }
    },
})

const upload = multer({ dest: 'static/images'});

/* Récupération du header bearer */
const extractBearerToken = headerValue => {
    if (typeof headerValue !== 'string') {
        return false
    }

    const matches = headerValue.match(/(bearer)\s+(\S+)/i)
    return matches && matches[2]
}

/* Vérification du token */
const checkTokenMiddleware = (req, res, next) => {
    // Récupération du token
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization)

    // Présence d'un token
    if (!token) {
        return res.status(401).json({ message: 'Error. Need a token' })
    }

    // Véracité du token
    jwt.verify(token, SECRET, (err, decodedToken) => {
        if (err) {
            res.status(401).json({ message: 'Error. Bad token' })
        } else {
            return next()
        }
    })
}

app.get('/', async (req, res) => {
    const results = await members.find({}).toArray();
    res.send(results);
})

app.post('/admin/login', async (req, res) => {
    if(!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Error. Please enter the correct username and password' });
    }

    const results = await adminLog.find({username: req.body.username, password: req.body.password}).toArray();
    if(!results) {
        return res.status(400).json({ message: 'Error. Wrong login or password' })
    }

    const token = jwt.sign({
        id: results._id,
        username : results.username
    }, SECRET, { expiresIn: "1h"})

    return res.json({ token: token});
})

app.get('/admin', checkTokenMiddleware, (req, res) => {
    // Récupération du token
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
    // Décodage du token
    const decoded = jwt.decode(token, { complete: false })

    return res.json({ content: decoded })
})

app.post('/admin', checkTokenMiddleware, (req, res) => {
    // Récupération du token
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
    // Décodage du token
    const decoded = jwt.decode(token, { complete: false })

    return res.json({ content: decoded })
});

///////////////////////////////////////////ADMIN SWEAT REQUESTS///////////////////////////////////////////

app.get('/admin/sweat', checkTokenMiddleware, async (req, res) => {
    let data;
    if(req.query._id) {
        data = await sweat.findOne({_id: new ObjectId(req.query._id)});
    } else {
        data = await sweat.find({}).toArray();
    }
    return res.json(data);
})

app.post('/admin/sweat', checkTokenMiddleware, async (req, res) => {
    if(!req.body.promo || !req.body.color) {
        return res.status(400).json({message: "please set promo or color"});
    }
    const data = {
        promo: req.body.promo,
        color: req.body.color,
        filenames:[]
    }
    const result = await sweat.insertOne(data);
    return res.json({message: `document was inserted whit the id ${result.insertedId}`, id: result.insertedId})
})

app.put('/admin/sweat', checkTokenMiddleware, async (req, res) => {
    if(!req.body._id || !req.body.color || !req.body.promo) {
        return res.status(400).json({message: "please set an id or a value to change (promo or color"});
    }
    const filter = {_id:new ObjectId(req.body._id)};
    const options = {upsert: false};
    const update = {
            $set: {
                color: req.body.color,
                promo: req.body.promo,
            }
        }
    const result = await sweat.updateOne(filter, update, options);
    const newDatas = await sweat.findOne(filter);
    return res.json({
        message: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        data: newDatas
    });
})

app.post('/admin/sweat/image', checkTokenMiddleware, upload.single('file'), async (req, res) => {
    
    if(!req.body.id) {
        return res.status(400).json({message: "please pass an id as argument"});
    }
    const filter = {_id:new ObjectId(req.body.id)};
    const update = {
        $addToSet: {
            "filenames": req.file.filename,
        }
    }
    const options = {upsert: false};
    const result = await sweat.updateOne(filter, update, options);
    const table = await sweat.findOne(filter);
    const index = table.filenames.indexOf(req.file.filename);
    return res.json({message: `file named ${req.file.filename} has been succefully stored in ${req.file.destination}`, index: index })
})

app.get('/admin/sweat/image', checkTokenMiddleware, async (req, res) => {
    if(!req.query.id || !req.query.filename) {
        return res.status(400).json({message: "no id or filename given"});
    }
    const dest = `${__dirname}/static/images/${req.query.filename}`;
    res.sendFile(dest, (err) => {
        console.log(err);
    })

})

app.delete("/admin/sweat/image", checkTokenMiddleware, async (req, res) => {
    if(!req.body.id || !req.body.filename) {
        return res.status(400).json({message: "no id or filename given"});
    }
    const dest = `${__dirname}/static/images/${req.body.filename}`;
    unlink(dest, (err) => {
        console.log(err);
    })
    const filter = {_id:new ObjectId(req.body.id)};
    const update = {
        $pull: {
            "filenames": req.body.filename,
        }
    }
    const options = {upsert: false};
    const result = await sweat.updateOne(filter, update, options);
    const newData = await sweat.findOne(filter);
    res.send({
        message: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        data: newData,
    })
})

app.listen(port, async () => {
    db = client.db(dbName);
    members = db.collection(collectionsName.members);
    adminLog = db.collection(collectionsName.adminLog);
    sweat = db.collection("sweat");
    console.log(`Example app listening on port ${port} and connected to db ${dbName}`)
})
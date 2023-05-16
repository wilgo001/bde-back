const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://bde-admin:iVZopL8BVx10cNVp@cluster0.gcko9w8.mongodb.net/?retryWrites=true&w=majority";
const dbName = "bde-esra-bretagne";
const collectionsName = {
    members: "membersTest",
    adminLog: "adminLog",
    sweat: "sweat",
}
const corsOptions = {
    origin: "http://localhost:3200"
}
let db;

/////COLLECTIONS/////
let members = null;
let adminLog = null;
let sweat = null;

module.exports = {
    connect: () => {
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        db = client.db(dbName);
        members = db.collection(collectionsName.members);
        adminLog = db.collection(collectionsName.adminLog);
        sweat = db.collection(collectionsName.sweat);
    },
    members: () => db?.collection(collectionsName.members),
    adminLog: () => db?.collection(collectionsName.adminLog),
    sweat: () => db?.collection(collectionsName.sweat),
    db: () => db,
    dbName: dbName,
    objectId: ObjectId
}
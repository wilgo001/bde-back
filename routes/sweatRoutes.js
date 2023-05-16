let express = require('express');
router = express.Router();

let mongoDB = require('../utils/mongoUtils');
let tokenUtils = require('../utils/tokenUtils');

router.get('/', tokenUtils.printPath, async (req, res) => {
    let data;
    if(req.query._id) {
        data = await mongoDB.sweat().findOne({_id: new mongoDB.objectId(req.query._id)});
    } else {
        data = await mongoDB.sweat().find({}).toArray();
    }
    return res.json(data);
})

module.exports = router;
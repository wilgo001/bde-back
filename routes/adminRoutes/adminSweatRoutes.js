let express = require('express');
router = express.Router();

let tokenUtils = require('../../utils/tokenUtils');
let mongoDB = require('../../utils/mongoUtils');

router.get('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, async (req, res) => {
    let data;
    if(req.query._id) {
        data = await mongoDB.sweat().findOne({_id: new mongoDB.objectId(req.query._id)});
    } else {
        data = await mongoDB.sweat().find({}).toArray();
    }
    return res.json(data);
})

router.post('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, async (req, res) => {
    if(!req.body.promo || !req.body.color) {
        return res.status(400).json({message: "please set promo or color"});
    }
    const data = {
        promo: req.body.promo,
        color: req.body.color,
        filenames:[]
    }
    const result = await mongoDB.sweat().insertOne(data);
    return res.json({message: `document was inserted whit the id ${result.insertedId}`, id: result.insertedId})
})

router.put('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, async (req, res) => {
    if(!req.body._id || !req.body.color || !req.body.promo) {
        return res.status(400).json({message: "please set an id or a value to change (promo or color"});
    }
    const filter = {_id:new mongoDB.objectId(req.body._id)};
    const options = {upsert: false};
    const update = {
            $set: {
                color: req.body.color,
                promo: req.body.promo,
            }
        }
    const result = await mongoDB.sweat().updateOne(filter, update, options);
    const newDatas = await mongoDB.sweat().findOne(filter);
    return res.json({
        message: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        data: newDatas
    });
})

router.delete("/", tokenUtils.printPath, tokenUtils.checkTokenMiddleware, async (req, res) => {
    if(!req.body.id) {
        return res.status(400).json({message: "no id given"});
    }
    const filter = {_id:new mongoDB.objectId(req.body.id)};
    const data = await mongoDB.sweat().findOne(filter);
    data.filenames.forEach((file) => {
        const dest = `${__dirname}/static/images/${file}`;
        unlink(dest, err => {
            console.log(err);
        })
    })
    const result = await mongoDB.sweat().deleteOne(filter);
    res.send({
        message: `successfully deleted ${result.deletedCount} sweat`
    })
    
})

module.exports = router;
let express = require('express');
router = express.Router();

let tokenUtils = require('../../utils/tokenUtils');
let mongoDB = require('../../utils/mongoUtils');
let fileUtils = require('../../utils/fileUtils');

router.get('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, async (req, res) => {
    if(!req.query.id || !req.query.filename) {
        return res.status(400).json({message: "nwtf bro"});
    }
    const dest = fileUtils.getPath(req.query.filename);
    res.sendFile(dest, (err) => {
        console.log(err);
    })

})

router.post('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, fileUtils.uploadSingle(), async (req, res) => {
    if(!req.body.id) {
        return res.status(400).json({message: "please pass an id as argument"});
    }
    const filter = {_id:new mongoDB.objectId(req.body.id)};
    const update = {
        $addToSet: {
            "filenames": req.file.filename,
        }
    }
    const options = {upsert: false};
    const result = await mongoDB.sweat().updateOne(filter, update, options);
    const table = await mongoDB.sweat().findOne(filter);
    const index = table.filenames.indexOf(req.file.filename);
    return res.json({message: `file named ${req.file.filename} has been succefully stored in ${req.file.destination}`, index: index })
})

router.delete('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, async (req, res) => {
    if(!req.body.id || !req.body.filename) {
        return res.status(400).json({message: "no id or filename given"});
    }
    const dest = fileUtils.getPath(req.body.filename);
    unlink(dest, (err) => {
        console.log(err);
    })
    const filter = {_id: new mongoDB.objectId(req.body.id)};
    const update = {
        $pull: {
            "filenames": req.body.filename,
        }
    }
    const options = {upsert: false};
    const result = await mongoDB.sweat().updateOne(filter, update, options);
    const newData = await mongoDB.sweat().findOne(filter);
    res.send({
        message: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        data: newData,
    })
})

module.exports = router
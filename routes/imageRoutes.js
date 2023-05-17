let express = require('express');
router = express.Router();

let tokenUtils = require('../utils/tokenUtils');
let fileUtils = require('../utils/fileUtils');


router.get('/', tokenUtils.printPath,  async (req, res) => {
    if(!req.query.filename) {
        return res.status(400).json({message: "no filename pass"});
    }
    const dest = fileUtils.getPath(req.query.filename);
    res.sendFile(dest, (err) => {
        console.log(err);
    })

})

module.exports = router;
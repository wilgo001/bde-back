let express = require('express');
router = express.Router();

let tokenUtils = require('../../utils/tokenUtils');
let mongoDB = require('../../utils/mongoUtils');

router.post('/', tokenUtils.printPath, async (req, res) => {
    if(!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Error. Please enter the correct username and password' });
    }

    const results = await mongoDB.adminLog().find({username: req.body.username, password: req.body.password}).toArray();
    if(!results) {
        return res.status(400).json({ message: 'Error. Wrong login or password' })
    }

    const newToken = tokenUtils.sign(results.id, results.username);

    return res.json({ token: newToken});
})

module.exports = router;
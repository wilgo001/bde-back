let express = require('express');
router = express.Router();

let tokenUtils = require('../utils/tokenUtils');

router.get('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, (req, res) => {
    // Récupération du token
    const newToken = req.headers.authorization && tokenUtils.extractBearerToken(req.headers.authorization)
    // Décodage du token
    const decoded = jwt.decode(newToken, { complete: false })

    return res.json({ content: decoded })
})

router.post('/', tokenUtils.printPath, tokenUtils.checkTokenMiddleware, (req, res) => {
    // Récupération du token
    const newToken = req.headers.authorization && tokenUtils.extractBearerToken(req.headers.authorization)
    // Décodage du token
    const decoded = jwt.decode(newToken, { complete: false })

    return res.json({ content: decoded })
});

module.exports = router;
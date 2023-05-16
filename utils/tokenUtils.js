const jwt = require("jsonwebtoken");
const SECRET = 'mykey';

const extractBearerToken = headerValue => {
    if (typeof headerValue !== 'string') {
        return false
    }

    const matches = headerValue.match(/(bearer)\s+(\S+)/i)
    return matches && matches[2]
}

module.exports = {

    /* Récupération du header bearer */
    extractBearerToken: extractBearerToken,

    printPath:(req, res, next) => {
        console.log(req.method + ' on ' + req.baseUrl + req.path);
        return next();
    },

    /* Vérification du token */
    checkTokenMiddleware: (req, res, next) => {
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
    },

    sign: (id, username) => {
        const token = jwt.sign({
            id: id,
            username: username,
        }, SECRET, {expiresIn: '1h'})
        return token;
    }

}
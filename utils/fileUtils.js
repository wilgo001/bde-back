const multer = require("multer");
const { unlink } = require("node:fs");
const {dirname} = require('path');
const appDir = dirname(require.main.filename);

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

module.exports = {
    uploadSingle:() => upload.single('file'),
    getPath:(filename) => `${appDir}/static/images/${filename}`,
    delete: (dest) => unlink(dest, (err) => err)
}
const {app} = require('../index');

const prePath = "/sweat/";

app.post(prePath + "users", (req, res) => {
    console.log(req.body);
})
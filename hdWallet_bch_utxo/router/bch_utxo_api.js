require('../db');

const mongoose = require('mongoose');
const Utxos = mongoose.model('Utxo');

const findDB = (query) => {
    return Utxos.find(query);
}

module.exports = (app) => {
    app.get('/getUtxos/:address', async (req, res) => {
        let addr = req.params.address;

        let query = { address : addr, useYN : "N"}
        let utxos = await findDB(query).lean(true).then(docs => {
            return docs;
        });

        console.log(utxos);
        res.end(JSON.stringify(utxos));
    });
}
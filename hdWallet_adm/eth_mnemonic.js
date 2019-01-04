const taskkill = require('taskkill');
const tasklist = require('tasklist');

const adm = require('./lib/adm');

module.exports = (app) => {

    app.get('/close', (req, res) => {
        process.exit(0);
    });

    app.get('/createWallet', async (req, res) => {
        let docs = {};

        let admWallet = await adm.newAccount();
        
        let admKey = admWallet.admKey;
        let mnemonicWords = admWallet.mnemonicWords;
        let address = admWallet.keypairHD.getAddress(0);
        let privateKey = (admWallet.keypairHD.getPrivateKey(0)).toString('hex');
        
        console.log("admKey :: " + admKey);
        console.log("mnemonic :: " + mnemonicWords);
        console.log("address :: " + address);
        console.log("privatKey :: " + privateKey);

        docs.admKey = admKey;
        docs.mnemonicWords = mnemonicWords;
        docs.address = address;
        docs.privateKey = privateKey;

        res.end(JSON.stringify(docs));
        return true;
    });

    app.post('/signTx', async (req, res) => {
        let to = req.body.to;
        let amt = req.body.amt;
        let key = req.body.key;
        let useKey = req.body.useKey;
        let keyInfo;
        let fromAddr;
        let pk;

        if(useKey == "admKey") {
            keyInfo = await adm.getAdmKey(key);
            fromAddr = keyInfo.address;
            pk = keyInfo.privateKey;
        } else if(useKey == "mnemonic") {
            keyInfo = await adm.getMnemonicKey(key);
            fromAddr = keyInfo.address;
            pk = keyInfo.privateKey
        }

        let rawTx = await adm.signTx(fromAddr, to, amt, pk);
        res.end(String(rawTx));
        return true;
    });

    app.post('/sendTx', async (req, res) => {
        let rawTx = req.body.rawTx;
        let txId = await adm.sendTx(rawTx);

        res.end(JSON.stringify(txId.transactionHash));
        return true;
    });

}
const adm = require('../adm/adm');
const commUtil = require('../adm/lib/utils/commUtil');

module.exports = (app) => {

    app.post('/close', (req, res) => {
        process.exit(0);
    });
    

    app.post('/createWallet', async (req, res) => {
        let coin = req.body.coin;
        let passwd = req.body.passwd;

		let walletData = await adm.createWallet(coin, passwd);
		await res.send(JSON.stringify(walletData));
		
		// commUtil.taskKill();
    });


    app.post('/signTx', async (req, res) => {
        let coin = req.body.coin;
        let to = req.body.to;
        let amt = req.body.amt;
		let key = req.body.key;
		let passwd = req.body.passwd;
        let useKey = req.body.useKey;
        
		let rawTxData = await adm.signTx(coin, to, amt, key, passwd, useKey);
		await res.send(rawTxData);

		commUtil.taskKill();
    });


	app.post('/sendTx', async (req, res) => {
        let coin = req.body.coin;
        let rawTx = req.body.rawTx;
		
		let txId = await adm.sendTx(coin, rawTx);
		await res.send(JSON.stringify(txId));

		commUtil.taskKill();
    });

}
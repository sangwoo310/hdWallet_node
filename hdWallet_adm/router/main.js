const adm = require('../adm/adm');
const commUtil = require('../adm/lib/utils/commUtil');


module.exports = (app) => {

	app.post('/close', (req, res) => {
		commUtil.taskKill();
	});

	app.post('/liveCheck', async (req, res) => {
		try {
			let resObj = {
				code: 000,
				message: true
			};
			res.json(await commUtil.fnCommReturnValue(req.url, resObj, 'success', req.body));
			res.end();
		} catch(e) {
			res.json(await commUtil.fnCommReturnValue(req.url, (e.message), 'error', req.body));
			res.end();
		}
	});


	app.post('/createWallet', async (req, res) => {
		try {
			// let coin = req.body.coin;
			let passwd = req.body.passwd;

			let walletData = await adm.createWallet(passwd).catch(e => {
				throw e;
			});

			res.json(await commUtil.fnCommReturnValue(req.url, walletData, 'success', req.body));
			res.end();
		} catch (e) {
			res.json(await commUtil.fnCommReturnValue(req.url, (e.message), 'error', null));
			res.end();
		}
	});


	app.post('/signTx', async (req, res) => {
		try {
			let coin = req.body.coin;
			let to = req.body.to;
			let amt = req.body.amt;
			let key = req.body.key;
			let passwd = req.body.passwd;
			let useKey = req.body.useKey;
			
			let rawTxData = await adm.signTx(coin, to, amt, key, passwd, useKey).catch(e => {
				throw e;
			});

			res.json(await commUtil.fnCommReturnValue(req.url, rawTxData, 'success', req.body));
			res.end();

		} catch(e) {
			res.json(await commUtil.fnCommReturnValue(req.url, (e.message), 'error', null));
			res.end();
		}
	});


	app.post('/sendTx', async (req, res) => {
		try {
		let coin = req.body.coin;
		let rawTx = req.body.rawTx;

		let txId = await adm.sendTx(coin, rawTx);

		res.json(await commUtil.fnCommReturnValue(req.url, JSON.stringify(txId), 'success', req.body));
		res.end();

		} catch(e) {
			res.json(await commUtil.fnCommReturnValue(req.url, (e.message), 'error', req.body));
			res.end();
		}
	});
}
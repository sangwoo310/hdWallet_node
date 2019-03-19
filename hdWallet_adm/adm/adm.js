const fncAdm = require('./adm_modules/fncAdm');

module.exports = {
    createWallet : async (passwd) => {
        try {
            let docs = {};
            let admWallet = await fncAdm.newAccount(passwd).catch( e => {
				throw e;
			});
            docs.admKey = admWallet.admKey;
            docs.mnemonicWords = admWallet.mnemonicWords;
            docs.btcAddress = admWallet.btcAddress;
            docs.ethAddress = admWallet.ethAddress;
            docs.bchAddress = admWallet.bchAddress;
            docs.btgAddress = admWallet.btgAddress;
            return docs;
        } catch(e) {
            throw e;
        }
    },

    signTx : async (coin, to, amt, key, passwd, useKey) => {
        try {       
            let keyInfo;
            // admKey or mnemonic use to get info 
            if(useKey == "admKey") {
                keyInfo = await fncAdm.getAdmKey(coin, key, passwd).catch( e => {
                    throw e;
                });
            } else if (useKey == "mnemonic") {
                keyInfo = await fncAdm.getMnemonicKey(coin, key, passwd).catch( e => {
                    throw e;
                });
            } else {
                throw new Error('useKey Error');
            }
            
            let fromAddr = keyInfo.address;
            let pk = keyInfo.privateKey;
            
            let rawTx = await fncAdm.signTx(coin, fromAddr, to, amt, pk).catch( e => {
				throw e;
            });
            return String(rawTx);
        } catch(e) {
            throw e;
        }
    },

    sendTx : (coin, rawTx) => {
        let txId = fncAdm.sendTx(coin, rawTx).catch(e => {
            throw e;
        });

        return txId;
    }
}
const fncAdm = require('./adm_modules/fncAdm');

module.exports = {
    createWallet : async (coin, passwd) => {
        let docs = {};

        let admWallet = await fncAdm.newAccount(coin, passwd);

        docs.admKey = admWallet.admKey;
        docs.mnemonicWords = admWallet.mnemonicWords;
        docs.address = admWallet.address;

        return docs;
    },

    signTx : async (coin, to, amt, key, passwd, useKey) => {
        let keyInfo;
        
        // admKey or mnemonic use to get info 
        if(useKey == "admKey") {
            keyInfo = await fncAdm.getAdmKey(coin, key, passwd);
        } else if(useKey == "mnemonic") {
            keyInfo = await fncAdm.getMnemonicKey(coin, key, passwd);
        }

        let fromAddr = keyInfo.address;
        let pk = keyInfo.privateKey;
        
        let rawTx = await fncAdm.signTx(coin, fromAddr, to, amt, pk);
        return String(rawTx);
    },

    sendTx : (coin, rawTx) => {
        let txId = fncAdm.sendTx(coin, rawTx);

        return txId;
    }
}
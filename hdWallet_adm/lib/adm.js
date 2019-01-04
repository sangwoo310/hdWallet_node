const EthereumBIP44 = require('ethereum-bip44/es5');

const util = require('./utils/util');
const admKey = require('./adm/admKey');
const admMnemonic = require('./adm/admMnemonic');
const admTx = require('./tx/admTx');

module.exports = {
    newAccount : async () => {
        let docs = {};

        let rng = await admKey.genKey();
        let key = await admKey.convert(rng);
        let enKey = await admKey.compound(key);
        let buf = await admKey.setBuf(enKey);
        let mnemonicWords = await admMnemonic.newEntropy(buf);
        let mnemonic = await admMnemonic.mnemonic(mnemonicWords);

        let keys = mnemonic.toHDPrivateKey();
        let keypairHD  = new EthereumBIP44(keys);

        docs.admKey = key;
        docs.mnemonicWords = mnemonicWords;
        docs.keypairHD = keypairHD;

        return docs;
    },

    getAdmKey : async (key) => {
        let docs = {};

        let enKey = await admKey.compound(key);
        let buf = await admKey.setBuf(enKey);
        let mnemonicWords = await admMnemonic.newEntropy(buf);
        let mnemonic = await admMnemonic.mnemonic(mnemonicWords);

        let keys = mnemonic.toHDPrivateKey();
        let keypairHD  = new EthereumBIP44(keys);

        docs.address = keypairHD.getAddress(0);
        docs.privateKey = keypairHD.getPrivateKey(0).toString('hex');

        return docs;
    },

    getMnemonicKey : async (key) => {
        let docs = {};

        let mnemonic = await admMnemonic.mnemonic(key);

        let keys = mnemonic.toHDPrivateKey();
        let keypairHD  = new EthereumBIP44(keys);

        docs.address = keypairHD.getAddress(0);
        docs.privateKey = keypairHD.getPrivateKey(0).toString('hex');

        return docs;
    },

    signTx : async (from, to, amt, pk) => {
        return admTx.signTx(from, to, amt, pk);
    },

    sendTx : async (rawTx) => {
        return admTx.sendTx(rawTx);
    }
}
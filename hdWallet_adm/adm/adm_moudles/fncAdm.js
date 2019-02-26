const bitcore = require('bitcore-lib');
const EthereumBIP44 = require('ethereum-bip44/es5');

const commUtil = require('../lib/utils/commUtil');

const admKey = require('../lib/genKey/admKey');
const admMnemonic = require('../lib/genKey/admMnemonic');
const admTx = require('../adm_tx/admTx');

module.exports = {
    newAccount : async (coin, passwd) => {
        let docs = {};
        
        let rng = await admKey.genKey();
        let key = await admKey.convert(rng);
        
        let enKey = await admKey.compound(key);
        let buf = await admKey.setBuf(enKey);
        let mnemonicWords = await admMnemonic.newEntropy(buf);
		let mnemonic = await admMnemonic.mnemonic(mnemonicWords);
        let hdPrivateKey = await mnemonic.toHDPrivateKey(passwd);
        // let hdPrivateKey = await mnemonic.toHDPrivateKey();  //none passwd
        
        docs.admKey = key;
        docs.mnemonicWords = mnemonicWords;
        
        if(coin == "eth") {
            let keypairHD = new EthereumBIP44(hdPrivateKey);

            // docs.childPk = (childKey.getPrivateKey(0)).toString('hex');
            docs.address = keypairHD.getAddress(0);
        } else {    // btc, bch, btg
            let derivePath = await commUtil.derivePath(coin);
            let childKey = await hdPrivateKey.derive(derivePath);
            // let childKey = await hdPrivateKey.derive("m/44'/0'/0'/0/0");
            let wif = await childKey.privateKey.toString('hex');

            let addr = new bitcore.PrivateKey(wif).toAddress();     //mainnet
            // let addr = new bitcore.PrivateKey(wif, "testnet").toAddress();    //testnet
         
            // address convert for btc, bch, btg
            addr = await commUtil.addrConvert(coin, addr);

            docs.childPk = childKey.privateKey.toString();
            docs.address = addr.toString();
        }

        return docs;
    },

    getAdmKey : async (coin, key, passwd) => {
        //key type = array
        let docs = {};
        
        let enKey = await admKey.compound(key);
        let buf = await admKey.setBuf(enKey);
        let mnemonicWords = await admMnemonic.newEntropy(buf);
        let mnemonic = await admMnemonic.mnemonic(mnemonicWords);   
        let hdPrivateKey = await mnemonic.toHDPrivateKey(passwd);
        
        if(coin == "eth") {
            let keypairHD  = new EthereumBIP44(hdPrivateKey);
            
            docs.address = keypairHD.getAddress(0);
        } else {    // btc, bch, btg
            let derivePath = await commUtil.derivePath(coin);
            let childKey = await hdPrivateKey.derive(derivePath);      
            let wif = childKey.privateKey.toString('hex');

            let addr = new bitcore.PrivateKey(wif).toAddress(); //mainnet
            // let addr = new bitcore.PrivateKey(wif, "testnet").toAddress();  //testnet

            // address convert for btc, bch, btg
            addr = await commUtil.addrConvert(coin, addr);

            docs.address = addr.toString();
            docs.privateKey = wif;
        }
      
        return docs;
    },

    getMnemonicKey : async (coin, key, passwd) => {
        // must be array type key obj !!
        let docs = {};
        
        let mnemonic = await admMnemonic.mnemonic(key);
        // let hdPrivateKey = await mnemonic.toHDPrivateKey(passwd);   //test
        let hdPrivateKey = await mnemonic.toHDPrivateKey();
        
        if(coin == "eth") {
            let keypairHD  = new EthereumBIP44(hdPrivateKey);

            docs.address = keypairHD.getAddress(0);
        } else {    // btc, bch, btg
            let derivePath = await commUtil.derivePath(coin);
            let childKey = await hdPrivateKey.derive(derivePath);
            
            let wif = childKey.privateKey.toString('hex');
            let addr = new bitcore.PrivateKey(wif).toAddress(); //mainnet
            // let addr = new bitcore.PrivateKey(wif, "testnet").toAddress();  //testnet

            // address convert for btc, bch, btg
            addr = await commUtil.addrConvert(coin, addr);

            docs.address = addr.toString();
            docs.privateKey = childKey.privateKey.toString();
        }

        return docs;
    },

    signTx : async (coin, from, to, amt, pk) => {        
        if(coin == "btc") {
            return admTx.btcSignTx(from, to, amt, pk);
        } else if(coin == "bch") {
            return admTx.bchSignTx(from, to, amt, pk);
        } else if(coin == "btg") {
            return admTx.btgSignTx(from, to, amt, pk);
        } else if(coin == "eth") {
            return admTx.ethSignTx(from, to, amt, pk);
        }
    },

    sendTx : async (coin, rawTx) => {
        return admTx.sendRawTransaction(coin, rawTx);
    }
}
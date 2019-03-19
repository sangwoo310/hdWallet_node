const bitcore = require('bitcore-lib');
const EthereumBIP44 = require('ethereum-bip44/es5');

const commUtil = require('../lib/utils/commUtil');

const admKey = require('../lib/genKey/admKey');
const admMnemonic = require('../lib/genKey/admMnemonic');
const admTx = require('../adm_tx/admTx');

module.exports = {
    newAccount : async (passwd) => {
        try {
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

            let btcDerivePath = await commUtil.derivePath("btc");
            let btcChildKey = await hdPrivateKey.derive(btcDerivePath);
            let btcWif = await btcChildKey.privateKey.toString('hex');
            let btcBfConAddr = new bitcore.PrivateKey(btcWif).toAddress();
            docs.btcAddress = await commUtil.addrConvert("btc", btcBfConAddr);

            let ethKeyPairHD = new EthereumBIP44(hdPrivateKey);
            docs.ethAddress = ethKeyPairHD.getAddress(0);

            let bchDerivePath = await commUtil.derivePath("bch");
            let bchChildKey = await hdPrivateKey.derive(bchDerivePath);
            let bchWif = await bchChildKey.privateKey.toString('hex');
            let bchBfConAddr = new bitcore.PrivateKey(bchWif).toAddress();
            docs.bchAddress = await commUtil.addrConvert("bch", bchBfConAddr);

            let btgDerivePath = await commUtil.derivePath("btg");
            let btgChildKey = await hdPrivateKey.derive(btgDerivePath);
            let btgWif = await btgChildKey.privateKey.toString('hex');
            let btgBfConAddr = new bitcore.PrivateKey(btgWif).toAddress();
            docs.btgAddress = await commUtil.addrConvert("btg", btgBfConAddr);

            return docs;
        } catch(e) {
            throw e;
        }
    },

    getAdmKey : async (coin, key, passwd) => {
        try {
            //key type = array
            let docs = {};
            
            let enKey = await admKey.compound(key);
            let buf = await admKey.setBuf(enKey);
            let mnemonicWords = await admMnemonic.newEntropy(buf);
            let mnemonic = await admMnemonic.mnemonic(mnemonicWords);   
            let hdPrivateKey = await mnemonic.toHDPrivateKey(passwd);
            // else if(coin == "btc" || coin == "bch" || coin == "btg" ) 추가     coin name 체크를 하기위해서 -----------------------------------------------
            if(coin == "eth") {
                let keypairHD  = new EthereumBIP44(hdPrivateKey);
                docs.address = keypairHD.getAddress(0);
                
            } else if(coin == "btc" || coin == "bch" || coin == "btg" ){    // btc, bch, btg
                let derivePath = await commUtil.derivePath(coin);
                let childKey = await hdPrivateKey.derive(derivePath);      
                let wif = childKey.privateKey.toString('hex');

                let addr = new bitcore.PrivateKey(wif).toAddress(); //mainnet
                // let addr = new bitcore.PrivateKey(wif, "testnet").toAddress();  //testnet

                // address convert for btc, bch, btg
                addr = await commUtil.addrConvert(coin, addr).catch( e => {
                    throw e;
                });

                docs.address = addr.toString();
                docs.privateKey = wif;
            } else {
                throw new Error('signTx coin name Error');
            }
        
            return docs;
        } catch(e) {
            throw e;
        }
    },

    getMnemonicKey : async (coin, key, passwd) => {
        try {
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
                addr = await commUtil.addrConvert(coin, addr).catch( e => {
                    throw e;
                });

                docs.address = addr.toString();
                docs.privateKey = childKey.privateKey.toString();
            }

            return docs;
        } catch(e) {
            throw e;
        }
    },

    signTx : async (coin, from, to, amt, pk) => {
        try {        
            if(coin == "btc") {
                return admTx.btcSignTx(from, to, amt, pk).catch(e=>{
                    throw e;
                });
            } else if(coin == "bch") {
                return admTx.bchSignTx(from, to, amt, pk).catch(e=>{
                    throw e;
                });
            } else if(coin == "btg") {
                return admTx.btgSignTx(from, to, amt, pk).catch(e=>{
                    throw e;
                });
            } else if(coin == "eth") {
                return admTx.ethSignTx(from, to, amt, pk).catch(e=>{
                    throw e;
                });
            } else {
                throw new Error('coin name error');
            }
        } catch(e) {
            throw e;
        }
    },

    sendTx : async (coin, rawTx) => {
        return admTx.sendRawTransaction(coin, rawTx).catch(e => {
            throw e;
        });
    }
}
const ethTx = require('ethereumjs-tx');
const explorers = require('bitcore-explorers');
const bitcore = require('bitcore-lib');

const bchLib = require('bitcore-lib-cash');
const bitboxcli = require('bitbox-cli/lib/bitbox-cli').default;
const bitbox = new bitboxcli();

const commUtil = require('../lib/utils/commUtil');
const config = require('../lib/utils/config');

module.exports = {
    btcSignTx : async (from, to, amt, fromPk) => {

        let insight;
        insight = await new explorers.Insight('https://insight.bitpay.com');  //btc mainnet
        // insight = new explorers.Insight('https://tetst-insight.bitpay.com');  //btc testnet
        return new Promise((resolve, reject) => {
            console.log(fromPk)
            console.log(typeof from)
            console.log(from)
            
            insight.getUnspentUtxos(from, function(err, docs){
                if(err) {
                    reject(err);
                } else {
                    let utxos = [];

                    for(let i=0; i<docs.length; i++) {
                        let utxo = {}

                        utxo.txId = docs[i].txId;
                        utxo.outputIndex = docs[i].outputIndex;
                        utxo.script = docs[i].script.toString();
                        utxo.satoshis = docs[i].satoshis;

                        utxos.push(utxo);
                    }

                    console.log('utxo   :   '+utxos);
                    console.log('docs   :   '+docs);
                    
                    let pk = new bitcore.PrivateKey(fromPk)

                    try {
                        let tx = new bitcore.Transaction().from(utxos)
                        .to(to, amt*(10**8)) // toAddr,amt(satoshis)
                        .change(from) // return amt addr
                        .fee(35000)
                        .sign(pk)

                        resolve(tx);
                    } catch(e) {
                        reject(e);
                    }
                }
            });
        });
    },

    bchSignTx : async (from, to, amt, fromPk) => {
        return new Promise((resolve, reject) => {
            bitbox.Address.utxo(from).then(utxos => {
                console.log(utxos);
                
                let pk = new bchLib.PrivateKey(fromPk)
                try {
                    let tx = new bchLib.Transaction()
                    .from(utxos)
                    .to(to, amt*(10**8))
                    .change(from)
                    .fee(35000)
                    .sign(pk)
                    resolve(tx)
                } catch(e) {
                    reject(e);
                }
            }).catch(e => {
                console.log(e)
                reject(e);
            });
        });
    },

    btgSignTx : async (from, to, amt, fromPk) => {
        return true;
    },

    ethSignTx : async (coin, from, to, amt, pk) => {
        try {
            let txParams = {
                nonce : '',
                gasPrice : '0xba43b7400',
                gasLimit : '0x61a80',
                to : '',
                value : ''
            }
            console.log('from : '+ from);
            txParams.nonce = "0x" + await commUtil.fetch('http://0.0.0.0:7500/'+from, 'GET')
            .catch(e => { 
                throw e;
            });
            txParams.to = to;
            txParams.value = "0x" + (amt*(10**18)).toString(16);
            
            let tx = new ethTx(txParams);
            let privKey = Buffer.from(pk, 'hex');
            tx.sign(privKey);
            let serializedTx = tx.serialize();
            let rawTx = '0x'+serializedTx.toString('hex');

            return rawTx;
        } catch (e) {
            throw e;
        }
    },

    ethSendTx : async (rawTx) => {
        let txId = await commUtil.fetch('http://0.0.0.0:7500/rawTx', 'POST')
        .catch(e => {
            console.log("!!! fetch Error !!!\n"+e);
            return e;
        });

        return txId;
    },

    sendRawTransaction : async (coin, rawTx) => {
        let sendUrl = await config[coin];
        let obj = {
            rawTx : rawTx
        }
        let txId = await commUtil.fetch(sendUrl, {   
                method:'POST', 
                body:JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            }
        ).catch(e => {
            console.log("!!! fetch Error !!!\n"+e);
            return e;
        });

        if(txId.error != null) {
            throw txId.error;
        }

        return txId.result;
    }
}
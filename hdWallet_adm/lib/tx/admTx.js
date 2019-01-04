// const web3 = require('web3');
const ethTx = require('ethereumjs-tx');
const util = require('../utils/util');

const txParams = {
    nonce : '',
    gasPrice : '0xba43b7400',
    gasLimit : '0x61a80',
    to : '',
    value : ''
}

module.exports = {
    signTx : async (from, to, amt, pk) => {
        txParams.nonce = "0x" + await util.fetch('http://211.214.183.85:7500/'+from, 'GET')
        .catch(e => {
            console.log("!!! fetch Error !!!\n" + e);
            return true;
        });
        txParams.to = to;
        // txParams.value = "0x" + (Number(web3.utils.toWei(amt))).toString(16);
        txParams.value = "0x" + (amt*(10**18)).toString(16);
        
        const tx = new ethTx(txParams);

        // var pk = 'ce0ee38e8cf09381cdd30e504d4996385144d320887b8f968478c8907e7c8e6c';
        var pk = pk;

        const privKey = Buffer.from(pk, 'hex');

        tx.sign(privKey);

        const serializedTx = tx.serialize();
        const rawTx = '0x'+serializedTx.toString('hex');

        console.log(rawTx);

        return rawTx;
    },

    sendTx : async (rawTx) => {
        let txId = await util.fetch('http://211.214.183.85:7500/rawTx', 'POST')
        .catch(e => {
            console.log("!!! fetch Error !!!\n"+e);
            return e;
        });

        return txId;
    }
}
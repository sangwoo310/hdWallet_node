require( './db.js' );
//const etherUnits = require("../lib/etherUnits.js");
//const BigNumber = require('bignumber.js');

const config = require('./config');

const mongoose = require( 'mongoose' );
const Utxo = mongoose.model( 'Utxo' );

const bitcoin = require('node-bitcoin-rpc');
bitcoin.init(config.host, config.port, config.user, config.pass);
bitcoin.setTimeout(20000);

//let currentBlock = 0;
let currentBlock = 478560;

const getBlockHash = async (blockNumber) => {
    return new Promise(async (resolve, reject) => {
        bitcoin.call('getblockhash', [blockNumber], (err, docs) => {
            try {
                if(err) {
                    console.log("!!! getBlockHash call error !!!\n"+err);
                    reject(err);
                } else {
                    blockHash = docs.result;
                    resolve(blockHash);
                }
            } catch(e) {
                console.log("!!! getBlockHash catch error !!!\n"+e);
                reject(e);
            }
        });
    });
}

const getBlock = (blockHash) => {
    return new Promise((resolve, reject) => {
        bitcoin.call('getblock', [blockHash], (err, docs) => {
            try {
                if(err) {
                    console.log("!!! getBlock call error !!!\n"+err);
                    reject(err);
                } else {
                    resolve(docs.result);
                }
            } catch(e) {
                console.log("!!! getBlock catch error !!!\n"+e);
                reject(e);
            }
        });
    });
}

const getRawTransaction = (txId) => {
    return new Promise((resolve, reject) => {
        bitcoin.call('getrawtransaction', [txId], (err, docs) => {
            try {
                if(err) {
                    console.log("!!! getRawTransaction call error !!!\n"+err);
                    reject(err)
                } else {
                    resolve(docs.result);
                }
            } catch(e) {
                console.log("!!! getRawTransaction catch error !!!\n"+e);
                reject(e);
            }
        });
    });
}

const decodeRawTransaction = (rawTx) => {
    return new Promise((resolve, reject) => {
        bitcoin.call('decoderawtransaction', [rawTx], (err, docs) => {
            try {
                if(err) {
                    console.log("!!! decodeRawTransaction call error !!!\n"+err);
                    reject(err)
                } else {
                    resolve(docs.result);
                }
            } catch(e) {
                console.log("!!! decodeRawTransaction catch error !!!\n"+e);
                reject(e);
            }
        });
    });
}

const utxoDB = (condition, query1, query2) => {
    return new Promise((resolve, reject) => {
        if(condition == "find") {
            resolve(Utxo.find(query1));
        } else if(condition == "update") {
            resolve(Utxo.updateOne(query1, query2));
        } else if(condition == "insert") {
            resolve(Utxo.collection.insert(query1));
        } else if(condition == "remove") {
            resolve(Utxo.remove(query1));
        } else {
            reject("!!! wrong condition !!!");
        }
    });
}

const dbInsert = async (txInfo, blockNumber) => {
    console.log("*** db insert start ***");

    return new Promise(async (resolve, reject) => {
        for(let i=0; i<txInfo.vout.length; i++) {
            try {
                let query1 = { blockNumber : blockNumber, txId : txInfo.txid, value : txInfo.vout[i].value, outputIndex : txInfo.vout[i].n, address : txInfo.vout[i].scriptPubKey.addresses[0] }
                let duplicationCheck = await utxoDB("find", query1)
                let dupliLength = duplicationCheck.length;
                // if(duplicationCheck > 0) {
                if(dupliLength > 0) {
                    console.log("*** data has been already inserted ***");
                    continue;
                } else {
                    let utxo = {
                        address : txInfo.vout[i].scriptPubKey.addresses[0],
                        blockNumber : blockNumber,
                        txId : txInfo.txid,
                        outputIndex : txInfo.vout[i].n,
                        script : txInfo.vout[i].scriptPubKey.asm,
                        value : txInfo.vout[i].value,
                        useYN : "N"
                    }
                    await utxoDB("insert", utxo).catch(e => {
                        console.log("!!! insert Error !!!\n"+e);
                    });
                }
            } catch(e) {
                console.log("!!! duplicationCheck Error !!!\n"+e);
                continue;
            }
        }
        console.log("*** db insert finish ***");
        resolve(true);
    });
}

const dbUpdate = async (txInfo, blockNumber) => {
    console.log("*** db update start ***");

    return new Promise(async (resolve, reject) => {
        for(let i=0; i<txInfo.vin.length; i++) {
            if(txInfo.vin[i].txid == undefined) {
                console.log("!!! reward Transaction !!!")
            } else {
                let txid = txInfo.vin[i].txid;
                let rawTx = await getRawTransaction(txid);
                let _txInfo = await decodeRawTransaction(rawTx);
    
                let fromAddr = _txInfo.vout[txInfo.vin[i].vout].scriptPubKey.addresses[0];
    
                let query1 = { txId : txid, address : fromAddr, useYN : "N"}
                let query2 = { $set : { useYN : "Y" } }
                
                await utxoDB("update", query1, query2).catch(e => {
                    console.log("!!! update Error !!!\n"+e);
                });
            }
        }
        console.log("*** db update finish ***");
        resolve(true);
    });
}


const watchBlock = () => {
    bitcoin.call('getblockcount', [], (err, docs) => {
        try {
            if(err) {
                console.log("!!! watchBlock call error !!!\n"+err);
                setTimeout(watchBlock, 5000);
            } else {
                console.log(docs);
                if(currentBlock < docs.result) {
                    // let difCoreBlock = docs - currentBlock;
                    currentBlock = docs.result;
                    // listenBlock(currentBlock, difCoreBlock);
                    // listenBlock(currentBlock);
                }
                setTimeout(watchBlock, 30000);
            }
        } catch(e) {
            console.log("!!! watchBlock catch error !!!\n"+e);
            setTimeout(watchBlock, 5000);
        }
    });
}

const initCheck = async () => {
    console.log("*** start utxo sync ***");
    let dbLatestBlock = await Utxo.find().sort('-blockNumber').limit(1);
    
    if(dbLatestBlock.length == 0) {
        listenBlock(478559);
    } else {
        console.log("*** db remove start ***");
        let query = { blockNumber : dbLatestBlock[0].blockNumber };
        await utxoDB("remove", query);
        
        console.log("*** db remove finish ***");
        listenBlock(dbLatestBlock[0].blockNumber);
    }
}

const listenBlock = async (blockNumber) => {
    console.log("*** listenBlock is " + blockNumber + " and currentBlock is "+ currentBlock +" ***");

    if(blockNumber == currentBlock) {
        setTimeout(listenBlock, 30000, currentBlock);
    } else if(blockNumber > currentBlock) {
        console.log("!!! dbBlock is higher then core Block !!!");
        process.exit(9);
    } else {
        let tempArr = [];
        let blockHash = await getBlockHash(blockNumber)
        let blockInfo = await getBlock(blockHash)
        
        for(let i=0; i<blockInfo.tx.length; i++) {
            console.log("blockNumber is " + blockNumber + " == " + blockInfo.tx.length + " :: " + i);
            let rawTx = await getRawTransaction(blockInfo.tx[i]).catch(e => {
                reject(e);
            });
            let txInfo = await decodeRawTransaction(rawTx).catch(e => {
                reject(e);
            });
            tempArr[i] = txInfo;
            await dbInsert(txInfo, blockInfo.height);
        }

        for(let i=0; i<tempArr.length; i++) {
            console.log("blockNumber is " + blockNumber + " == " + tempArr.length + " :: " + i);
            await dbUpdate(tempArr[i], blockInfo.height);
        }
        await listenBlock(blockNumber+1);
    }
}


watchBlock();
setTimeout(initCheck, 3000);

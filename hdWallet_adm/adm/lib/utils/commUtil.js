const doFetch = require('node-fetch');
const bs58check = require('bs58check');
const taskkill = require('taskkill');
const tasklist = require('tasklist');
const bchaddrjs = require('bchaddrjs');

const ranCheck = (ranArr, rnum) => {
    try {
        for(let i=0; i<ranArr.length; i++) {
            if(ranArr[i] == rnum) {
                return false;
            }
        }
        return true;
    } catch(e) {
        throw e;
    }
}

const fnLogEvent = (fnName, res , state, param) => {
    var date = new Date();
    var log = {};
    log.function = fnName;
    log.time = date.toString().substring(0,24);
    log.parameter = param;
    log.state = state;
    log.result = res;
    console.log("%j",log);

}

module.exports = {
    taskKill : () => {
        try {
            const input = ["node.exe"];
            var opts = {};
            opts.force = true;
            opts.tree = true;
            taskkill(input, opts).then(() => {
                console.log('*** task success ***');
            });
        } catch(e) {
            throw e;
        }
    },

    fetch : (url, method) => {
        return doFetch(url, method)
        .then(__docs => {
            return __docs.json();
        }).then(_docs => {
            return _docs;
        }).catch((err) => {
            //console.error(err)
            console.log(111111)
            throw err;
        });
    },

    genRanNum : () => {
        return new Promise( async (resolve, reject) => {
            let ranCheckArr = [];
            while(true) {
                if(ranCheckArr.length == 6) {
                    resolve(ranCheckArr);
                    break;
                } else {
                    let rnum = Math.floor(Math.random() * 16); //난수발생
                    let checkNum = await ranCheck(ranCheckArr, rnum);
                    if(checkNum) {
                        ranCheckArr.push(rnum);
                    } else {
                        continue;
                    }
                }
            }
        }).catch(function (err) {
            reject(err);
        });
    },

    derivePath : coin => {
        try{
            let derivePath = "";
            if(coin == "btc") {
                derivePath = "m/44'/0'/0'/0/0"; //testnet 1 mainnet 0
            } else if(coin == "bch") {
                derivePath = "m/44'/145'/0'/0/0";
            } else if(coin == "btg") {
                derivePath = "m/44'/156'/0'/0/0";
            } else {
                throw new Error('createWallet coin name error');
            }
            return derivePath;
        } catch(e) {
            throw e;
        }
    },

    addrConvert : async (coin, addr) => {
        return new Promise(async (resolve, reject) => {
            if(coin == "btc"){
                resolve(addr.toString());
            } else if(coin == "bch") {
                const cash = bchaddrjs.toCashAddress;
                let cashAddr = await cash(addr.toString());

                resolve(cashAddr);
            } else if(coin == "btg") {
                let decode = await bs58check.decode(addr.toString());
                decode[0] = 38;
                let convertAddr = await bs58check.encode(decode);

                resolve(convertAddr);
            }
        }).catch(function (err){
            reject(err);
        });
    },

    fnCommReturnValue : async (fnName, res , state, param) => {
        var obj = {
            code : '' ,
            result : '' ,
            message : ''
        }

        if (state == 'success'){
            obj.code = '000';
            obj.result = res;
        } else { // = else if (stats =='error')
            console.log(res);
            switch(res) {
                case 'signTx coin name Error' :
                    obj.code = '001';
                    break;
                case 'The value of "offset" is out of range. It must be >= 0 and <= 13. Received 14' :
                    obj.code = '002';
                    break;
                case 'Invalid Argument: Amount is expected to be a positive integer' :
                    obj.code = '003';
                    break;
                case 'Address has mismatched network type.' :
                    obj.code = '004';
                    break;
                default :
                    obj.code = '999';
            }
            obj.message = res;
        }
        fnLogEvent(fnName, res , state, param);
        return obj;
    }
}

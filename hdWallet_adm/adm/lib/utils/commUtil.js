const doFetch = require('node-fetch');
const bs58check = require('bs58check');
const taskkill = require('taskkill');
const tasklist = require('tasklist');
const bchaddrjs = require('bchaddrjs');

const ranCheck = (ranArr, rnum) => {
    for(let i=0; i<ranArr.length; i++) {
        if(ranArr[i] == rnum) {
            return false;
        }
    }
    return true;
}

module.exports = {
    taskKill : () => {
        const input = ["node.exe"];
		var opts = {};
		opts.force = true;
		opts.tree = true;
		taskkill(input, opts).then(() => {
			console.log('*** task success ***');
		});
    },

    fetch : (url, method) => {
        return doFetch(url, method)
        .then(__docs => {
            return __docs.json();
        }).then(_docs => {
            return _docs;
        }).catch((err) => {
            console.error(err)
            throw err
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
        });
    },

    derivePath : coin => {
        let derivePath = "";

        if(coin == "btc") {
            derivePath = "m/44'/0'/0'/0/0"; //testnet 1 mainnet 0
        } else if(coin == "bch") {
            derivePath = "m/44'/145'/0'/0/0";
        } else if(coin == "btg") {
            derivePath = "m/44'/156'/0'/0/0";
        }

        return derivePath;
    },

    addrConvert : async (coin, addr) => {
        return new Promise(async (resolve, reject) => {
            if(coin == "btc"){
                resolve(addr);
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
        });
    }
}

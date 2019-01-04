const util = require('../utils/util');
const keyList = require('./keyList');

module.exports = {
    genKey : async () => {
        let generalate = util.genRanNum();
        return generalate;
    },

    convert : (arr) => {
        let subtitueArr = [];

        for(let i=0; i<arr.length; i++) {
            subtitueArr[i] = keyList[arr[i]]
        }

        return subtitueArr;
    },

    compound : async (arr) => {
        var conNum = 1;
        var convertArr = [];
        
        for(let i=0; i<6; i++) {
            var switchNum = i+conNum;
        
            if(i+conNum >= 6) {
                switchNum = switchNum%6
            }
            await convertArr.push(String(arr[i])+String(arr[switchNum]));
            await convertArr.push(String(arr[switchNum])+String(arr[i]));
        }
        for(let i=0; i<4; i++) {
            await convertArr.push(String(arr[i])+String(arr[i+2]));
        }

        return convertArr;
    },

    setBuf : (bufNum) => {
        let buf = new Buffer.alloc(16);

        for(let i=0; i<16; i++) {
            buf[i] = "0x"+bufNum[i]
        }

        return buf;
    }
}
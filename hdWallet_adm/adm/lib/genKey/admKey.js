const commUtil = require('../utils/commUtil');
const keyList = require('./keyList');

module.exports = {
    genKey : async () => {
        try{
            let generalate = commUtil.genRanNum();
            return generalate;
        }catch(e){
            throw e;
        }
    },

    convert : (arr) => {
        try{
            let subtitueArr = [];

            for(let i=0; i<arr.length; i++) {
                subtitueArr[i] = keyList[arr[i]]
            }
            return subtitueArr;
        }catch(e){
            throw e;
        }
    },

    compound : async (arr) => {
        try{

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
        }catch(e){
            throw e;
        }
    },

    setBuf : (bufNum) => {
        try{
            let buf = new Buffer.alloc(16);

            for(let i=0; i<16; i++) {
                buf[i] = "0x"+bufNum[i]
            }
            return buf;
        }catch(e){
            throw e;
        }
    }
}
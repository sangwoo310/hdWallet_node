const doFetch = require('node-fetch');

const ranCheck = (ranArr, rnum) => {
    for(let i=0; i<ranArr.length; i++) {
        if(ranArr[i] == rnum) {
            return false;
        }
    }
    return true;
}

module.exports = {
    fetch : (url, method) => {
        return doFetch(url, {method: method})
        .then(docs => {
            return docs.json();
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
    }
}
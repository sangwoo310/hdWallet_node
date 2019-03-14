const mongoose = require( 'mongoose' );
const Schema   = mongoose.Schema;

const Utxo = new Schema(
{
    address : String,
    blockNumber : Number,
    txId : String,
    outputIndex : Number,
    script : String,
    value : String,
    useYN : String
});


// create indices
Utxo.index( { address : 1 } );

mongoose.model('Utxo', Utxo);
module.exports.Utxo = mongoose.model('Utxo');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/utxosDB');

mongoose.set('debug', true);

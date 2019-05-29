const mongoose = require('mongoose');
const {MongoClient, ObjectID} = require('mongodb');
	Schema = mongoose.Schema;
let exp = process.env.EXP_TIME


const trackDataSchema = new Schema({
	partId: {type: String, unique: true, required: true},
	techName: {type: Schema.Types.ObjectId, ref: 'Technician', required: true},
	trackCode: {type: String, unique: true, required: true},
	courier: {type: String, required: true},
	delivered: {type: Date},
	startDate: String,
	lastDate: String
});





const TrackData = mongoose.model('trackData', trackDataSchema)

if(!isNaN(parseInt(exp)) && exp > 0) {
	TrackData.collection.createIndex({ "delivered": 1 }, { expireAfterSeconds: exp * 3600 * 24} )
	TrackData.collection.dropIndex('delivered_1', function(err, result) {
	    if (err) {
	        console.log('Error in dropping index!', err);
	    }
	});
	TrackData.collection.createIndex({ "delivered": 1 }, { expireAfterSeconds: exp * 3600 * 24 } )
}else{
	TrackData.collection.createIndex({ "delivered": 1 }, { expireAfterSeconds: exp * 3600 * 24 } )
	TrackData.collection.dropIndex('delivered_1', function(err, result) {
	    if (err) {
	        console.log('Error in dropping index!', err);
	    }
	});
}

module.exports = {TrackData}

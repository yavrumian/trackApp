const mongoose = require('mongoose');
const {MongoClient, ObjectID} = require('mongodb');
	Schema = mongoose.Schema;
const exp = process.env.EXP_TIME
const trackDataSchema = new Schema({
	partId: {type: String, unique: true, required: true},
	techName: {type: Schema.Types.ObjectId, ref: 'Technician', required: true},
	trackCode: {type: String, unique: true, required: true},
	courier: {type: String, required: true},
	delivered: {type: Date, expires: exp+'m'},
	startDate: String,
	lastDate: String
});





const TrackData = mongoose.model('trackData', trackDataSchema)

TrackData.collection.dropIndex('delivered_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});
module.exports = {TrackData}

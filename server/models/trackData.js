const mongoose = require('mongoose')
	Schema = mongoose.Schema;

const trackDataSchema = new Schema({
	partId: String,
	techName: {type: Schema.Types.ObjectId, ref: 'technician'},
	trackCode: String,
	date: Date,
	status: String
});

const TrackData = mongoose.model('trackData', trackDataSchema)

module.exports = {TrackData}

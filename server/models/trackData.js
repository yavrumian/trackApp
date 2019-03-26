const mongoose = require('mongoose')
	Schema = mongoose.Schema;

const trackDataSchema = new Schema({
	partId: {type: String, unique: true, required: true},
	techName: {type: Schema.Types.ObjectId, ref: 'Technician', required: true},
	trackCode: {type: String, unique: true, required: true},
	courier: {type: String, required: true}
});

const TrackData = mongoose.model('trackData', trackDataSchema)

module.exports = {TrackData}

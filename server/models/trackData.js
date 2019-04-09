const mongoose = require('mongoose')
	Schema = mongoose.Schema;
const exp = process.env.EXP_TIME * 24 * 3600
const trackDataSchema = new Schema({
	partId: {type: String, unique: true, required: true},
	techName: {type: Schema.Types.ObjectId, ref: 'Technician', required: true},
	trackCode: {type: String, unique: true, required: true},
	courier: {type: String, required: true},
	delivered: Date,
	startDate: String,
	lastDate: String
});

trackDataSchema.index({ delivered: 1 }, { expireAfterSeconds: exp });

const TrackData = mongoose.model('trackData', trackDataSchema)

module.exports = {TrackData}

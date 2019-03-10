const _ = require('lodash')
const {TrackData} = require('../models/trackData')

exports.addTrack = async (req, res) => {
	try{
		const body = _.pick(req.body, ['partId', 'techName', 'trackCode', 'date', 'status']);
		const track = new TrackData(body);
		await track.save();
		res.send(track)
	}catch(e){
		console.log(e);
		res.status(400).send(e)
	}
}

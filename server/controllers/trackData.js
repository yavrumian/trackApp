const _ = require('lodash'),
	{validationResult } = require('express-validator/check');

const {TrackData} = require('../models/trackData')

exports.addTrack = async (req, res) => {
	//Get errors from express-validator
	const errors = validationResult(req);

	try{
		if(!errors.isEmpty()) //throw error if exists any
			throw errors.array()
		//pick values from body to avoid from unwished data
		const body = _.pick(req.body, ['partId', 'techName', 'trackCode', 'date', 'status']);
		//create new doc and save it
		const track = new TrackData(body);
		await track.save();
		res.send(track)
	}catch(e){
		res.status(400).send(e)
	}
}

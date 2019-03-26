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
		const body = _.pick(req.body, ['partId', 'techName', 'trackCode', 'courier']);
		//create new doc and save it
		const track = new TrackData(body);
		await track.save();
		res.send(track)
	}catch(e){
		console.log(e);
		if(e[0]){
			return res.status(400).send({type: e[0].msg.type, msg: e[0].msg.msg})
		}else if(e.errmsg && e.errmsg.includes('duplicate') && e.errmsg.includes('partId')){
			return res.status(400).send({type: 'db-error', msg: 'Part ID already exists, choose another'})
		}else if(e.errmsg && e.errmsg.includes('duplicate') && e.errmsg.includes('trackCode')){
			return res.status(400).send({type: 'db-error', msg: 'Track Code already exists, choose another'})
		}
		res.status(400).send(e)
	}
}

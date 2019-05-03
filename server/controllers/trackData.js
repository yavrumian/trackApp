
const _ = require('lodash'),
	{validationResult } = require('express-validator/check');

const {TrackData} = require('../models/trackData'),
	{Technician} = require('../models/technician')

exports.addTrack = async (req, res) => {
	//Get errors from express-validator
	const errors = validationResult(req);
	if(process.env.DEBUG =='true'){
		console.log(`FROM: /server/controllers/trackData.js, line:11 \nROUTE: /trackData/add\nREQUEST BODY:`)
		console.log(req.body);
		console.log('==================================================================');
	}
	try{
		if(!errors.isEmpty()) //throw error if exists any
			throw errors.array()
		//pick values from body to avoid from unwished data
		const body = _.pick(req.body, ['partId', 'techName', 'trackCode', 'courier']);
		//check if there's data with given name and throw error if exists
		const doc = await Technician.find({name: body.partId})
		if(doc[0]) throw {code: 11000, msg:'There\'s a doc with this name' }
		//create new doc and save it
		const track = new TrackData(body);
		const tech = await Technician.findOneAndUpdate({_id: body.techName}, {$push:{datas: track._id}}, {new:true});
		await track.save();
		res.send(track)
	}catch(e){
		if(process.env.DEBUG =='true'){
			console.log('ERROR at /server/controllers/trackData.js, line: 28');
			console.log(e);
			console.log('==================================================================');
		}
		if(e[0]){
			return res.status(400).send({type: e[0].msg.type, msg: e[0].msg.msg})
		}else if(e.errmsg && e.errmsg.includes('duplicate') && e.errmsg.includes('partId')){
			return res.status(400).send({type: 'db-error', msg: 'Name is used as partId or technician name, pick another'})
		}else if(e.errmsg && e.errmsg.includes('duplicate') && e.errmsg.includes('trackCode')){
			return res.status(400).send({type: 'db-error', msg: 'Track Code already exists, choose another'})
		}else if(e.code == 11000){
			return res.status(400).send({type: 'mongo-error', msg: 'Name is used as partId or technician name, pick another'})
		}
		res.status(400).send(e)
	}
}

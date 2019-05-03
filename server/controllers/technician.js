const _ = require('lodash'),
	{validationResult } = require('express-validator/check');

const {Technician} = require('../models/technician'),
	{TrackData} = require('../models/trackData')

exports.addTechnician = async (req, res) => {
	//Get errors from express-validator
	const errors = validationResult(req);

	if(process.env.DEBUG =='true'){
		console.log(`AT: /server/controllers/technician.js, line: 11 \nROUTE: /teachnician/add\nREQUEST BODY:`)
		console.log(req.body);
		console.log('==================================================================');
	}
	try{
		if(!errors.isEmpty()) //throw error if exists any
			throw errors.array()
		//pick values from body to avoid from unwished data
		const body = _.pick(req.body, 'name');

		//check if there's data with given name and throw error if exists
		const doc = await TrackData.find({partId: body.name})
		console.log(doc[0]);
		if(doc[0]) throw {code: 11000, msg:'There\'s a doc with this name' }
		//create new doc and save it
		await new Technician(body).save();
		//get All Technicians and send to client
		const data = await Technician.find({});
		res.send(data)
	}catch(e){
		if(process.env.DEBUG == 'true'){
			console.log('ERROR at /server/controllers/technician.js, line: 28');
			console.log(e);
			console.log('==================================================================');
		}
		if(e.code == 11000){
			return res.status(400).send({type: 'mongo-error', msg: 'Name is used as partId or technician name, pick another'})
		}else if(e[0].msg.type == 'tech-validation'){
			return res.status(400).send({type: 'validation-error', msg: 'Technician name must contain at least 3 characters'})
		}
		res.status(400).send(e)
	}
}

exports.delete = async (req, res) => {
	if(process.env.DEBUG =='true'){
		console.log(`AT: /server/controllers/technician.js, line: 44 \nROUTE: /teachnician/delete/:id\nREQUEST BODY:`)
		console.log(req.params);
		console.log('==================================================================');
	}
	const id = req.params.id;
	try{
		await TrackData.deleteMany({techName: id})
		await Technician.findByIdAndDelete(id)
		res.end()
	}catch(e){
		if(process.env.DEBUG == 'true'){
			console.log('ERROR at /server/controllers/technician.js, line: 51');
			console.log('**Error\'s too long, uncomment line 53 to see it');
			// console.log(e);
			console.log('==================================================================');
		}
		res.status('404').end()
	}
}

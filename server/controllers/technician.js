const _ = require('lodash'),
	{validationResult } = require('express-validator/check');

const {Technician} = require('../models/technician')

exports.addTechnician = async (req, res) => {
	//Get errors from express-validator
	const errors = validationResult(req);

	try{
		if(!errors.isEmpty()) //throw error if exists any
			throw errors.array()
		//pick values from body to avoid from unwished data
		const body = _.pick(req.body, 'name');
		//create new doc and save it
		const technician = new Technician(body);
		await technician.save();
		res.send(technician)
	}catch(e){
		console.log(e);
		res.status(400).send(e)
	}
}

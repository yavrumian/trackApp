const _ = require('lodash')
const {Technician} = require('../models/technician')

exports.addTechnician = async (req, res) => {
	try{
		const body = _.pick(req.body, 'name');
		const technician = new Technician(body);
		await technician.save();
		res.send(technician)
	}catch(e){
		console.log(e);
		res.status(400).send(e)
	}
}

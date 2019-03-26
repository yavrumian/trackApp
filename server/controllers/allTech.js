const {Technician} = require('../models/technician')

exports.getAll = async (req, res) => {
	try{
		const data = await Technician.find({});
		res.send(data)
	}catch(e){
		res.send(e)
	}
}

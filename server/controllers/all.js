const {TrackData} = require('../models/trackData')

exports.getAll = async (req, res) => {
	try{
		const data = await TrackData.find({});
		res.send(data)
	}catch(e){
		res.send(e)
	}
}

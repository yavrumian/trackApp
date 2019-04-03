const request = require('request-promise');

const {Technician} = require('../models/technician')

exports.getAll = async (req, res) => {
	try{
		let data = await Technician.find({}).populate('datas');
		for (let i = 0; i < data.length; i++) {
			for (let x = 0; x < data[i].datas.length; x++) {
				let itemData = await request(`${req.protocol}://${req.hostname}:8020/search?partId=${data[i].datas[x].partId}`)
				itemData = JSON.parse(itemData)
				data[i].datas[x] = itemData[0]
			}
		}
		// cons/ole.log(data[0]);
		res.send(data)
	}catch(e){
		res.send(e)
	}
}

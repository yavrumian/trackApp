const request = require('request-promise');

const {Technician} = require('../models/technician')

exports.getAll = async (req, res) => {
	if(process.env.DEBUG =='true'){
		console.log(`AT: /server/controllers/allTech.js, line: 7 \nROUTE: /allTech`)
		console.log('==================================================================');
	}
	try{
		let data = await Technician.find({}).populate('datas');
		for (let i = 0; i < data.length; i++) {
			for (let x = 0; x < data[i].datas.length; x++) {
				let itemData = await request(`${process.env.HOST}/search?partId=${data[i].datas[x].partId}`)
				itemData = JSON.parse(itemData)
				itemData = itemData[0]
				data[i].datas[x] = itemData
			}
		}
		res.send(data)
	}catch(e){
		if(process.env.DEBUG =='true'){
			console.log('ERROR at /server/controllers/allTech.js, line: 22');
			console.log(e);
			console.log('==================================================================');
		}
		res.status(400).send(e)
	}
}

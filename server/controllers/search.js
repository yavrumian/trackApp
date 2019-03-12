const request = require('request-promise');
const {TrackData} = require('../models/trackData'),
parseString = require('xml2js').parseString;
exports.search = async (req, res) => {

	try{
		const data = await TrackData.findOne({partId: req.query.partId})
		if(!data) throw new Error('No data is found')
		const url =`http://production.shippingapis.com/ShippingApi.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22${process.env.USPS_ID}%22%3E%3CTrackID%20ID=%22${data.trackCode}%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E`
		var xml = await request('http://production.shippingapis.com/ShippingApi.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22048DUEX04922%22%3E%3CTrackID%20ID=%229405515901123133858805%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E');
		parseString(xml, (err, res) => {
			console.log(JSON.stringify(res, null, 1));
		})

	}catch(e){
		console.log(e);
	}
}

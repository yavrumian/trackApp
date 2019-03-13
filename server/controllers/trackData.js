const _ = require('lodash'),
	request = require('request-promise'),
	convert = require('xml-js').xml2json;
const {TrackData} = require('../models/trackData')

exports.addTrack = async (req, res) => {
	try{
		const url =`http://production.shippingapis.com/ShippingApi.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22${process.env.USPS_ID}%22%3E%3CTrackID%20ID=%22${req.body.trackCode}%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E`
		let xml = await request(url);
		console.log(JSON.parse(convert(xml, {compact: true, spaces: 4})));
		if(JSON.parse(convert(xml, {compact: true, spaces: 4})).Error)
			throw {type: 'api-error', text: 'Invalid Credentials'}
		if(JSON.parse(convert(xml, {compact: true, spaces: 4})).TrackResponse.TrackInfo.Error)
			throw {type: 'api-error', text: 'Invalid Track Code'}
		const body = _.pick(req.body, ['partId', 'techName', 'trackCode', 'date', 'status']);
		const track = new TrackData(body);
		await track.save();
		res.send(track)
	}catch(e){
		console.log(e.text);
		res.status(400).send(e)
	}
}

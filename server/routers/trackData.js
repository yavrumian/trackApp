const router = require('express').Router(),
	convert = require('xml-js').xml2json,
	request = require('request-promise'),
	{check} = require('express-validator/check');

router.post('/add',[
	//add validations
	check('partId')
		.isLength({min:3})
		.trim()
    		.escape()
		.withMessage({type: 'track-data-validation', text: 'Part ID must have at least 3 characters'}),
	check('techName')
		.isLength({min:3})
		.trim()
    		.escape()
		.withMessage({type: 'track-data-validation', text: 'Tech name must have at least 3 characters'}),
	check('trackCode')
		.trim()
    		.escape()
		.custom(async value => {
			//Know if there's error
			const url =`http://production.shippingapis.com/ShippingApi.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22${process.env.USPS_ID}%22%3E%3CTrackID%20ID=%22${value}%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E`
			const xml = await request(url);
			if(JSON.parse(convert(xml, {compact: true, spaces: 4})).Error)
				 throw {type: 'api-error', text:'Invalid Credentials'}
			if(JSON.parse(convert(xml, {compact: true, spaces: 4})).TrackResponse.TrackInfo.Error)
				throw {type: 'api-error', text:'Invalid track code'}
		})

], require('../controllers/trackData').addTrack)

module.exports = router

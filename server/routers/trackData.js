const router = require('express').Router(),
	convert = require('xml-js').xml2json,
	request = require('request-promise'),
	{check} = require('express-validator/check');

const {Technician} = require('../models/technician')
let statusCode;
router.post('/add',[
	//add validations
	check('partId')
		.isLength({min:3})
		.trim()
    		.escape()
		.withMessage({type: 'track-data-validation', msg: 'Part ID must have at least 3 characters'}),
	check('techName')
		.trim()
    		.escape()
		.custom(async value => {
			try{
				const tech = await Technician.findOne({_id: value})
				if(!tech) {
					throw {type: 'validation-error', msg: 'Invalid technician name'}
				}
			}catch(e){
				throw e
			}
		}),
	check('trackCode')
		.trim()
    		.escape()
		.custom(async (value, {req}) => {
			//Know if there's error
			const urlUSPS =`http://production.shippingapis.com/ShippingApi.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22${process.env.USPS_ID}%22%3E%3CTrackID%20ID=%22${value}%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E`;
			const urlFedEx = `https://www.fedex.com/trackingCal/track?data={%22TrackPackagesRequest%22:{%22trackingInfoList%22:[{%22trackNumberInfo%22:{%22trackingNumber%22:%22${value}%22}}]}}&action=trackpackages`
			const usps = await request(urlUSPS);
			const fedEx = await request(urlFedEx);

			if(!JSON.parse(convert(usps, {compact: true, spaces: 4})).Error && !JSON.parse(convert(usps, {compact: true, spaces: 4})).TrackResponse.TrackInfo.Error){
				statusCode = 0;
				req.body.courier = 'USPS'
			}else if(JSON.parse(fedEx).TrackPackagesResponse.packageList[0].trackingQualifier){
				statusCode = 0;
				req.body.courier = 'fedEx'
			}else{
				statusCode = -1
			}
			if(statusCode == -1)
				throw {type: 'api-error', msg:'Invalid Tracking Code'}
		})

], require('../controllers/trackData').addTrack)

module.exports = router
/*if(!JSON.parse(fedEx).TrackPackagesResponse.packageList[0].trackingQualifier && (JSON.parse(convert(xml, {compact: true, spaces: 4})).Error || JSON.parse(convert(xml, {compact: true, spaces: 4})).TrackResponse.TrackInfo.Error))*/

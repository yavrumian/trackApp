const request = require('request-promise'),
	cheerio = require('cheerio'),
	convert = require('xml-js').xml2json;
const {TrackData} = require('../models/trackData')

exports.search = async (req, res) => {
	let body;
	if(process.env.DEBUG =='true'){
		console.log(`AT: /server/controllers/search.js, line: 7 \nROUTE: /search\nREQUEST BODY:`)
		console.log(req.query);
		console.log('==================================================================');
	}
	try{
		//Find doc with given data, throw error if there's no doc
		const data = await TrackData.findOne({partId: req.query.partId}).populate('techName')
		if(!data)
			throw {type: 'search-db', msg: "Invalid part ID"}
		if(data.courier == "USPS"){
			const urlUSPS =`http://production.shippingapis.com/ShippingApi.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22${process.env.USPS_ID}%22%3E%3CTrackID%20ID=%22${data.trackCode}%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E`
			//Make request to USPS with given data and parse it
			let usps = await request(urlUSPS);
			let parsedXML = JSON.parse(convert(usps, {compact: true, spaces: 4})).TrackResponse.TrackInfo;
			if(process.env.DEBUG =='true'){
				console.log(`AT: /server/controllers/search.js, line: 19 \nROUTE: /search\nREQUEST TO:${urlUSPS}\nRESPONSE: `)
				console.log('**Response\'s too long, uncomment line 26 to see it');
				//console.log(parsedXML);
				console.log('==================================================================');
			}
			//If is not delivered make request to get expected date
			let expected;
			if(!parsedXML.TrackSummary.Event._text.includes('Delivered')){
				let html = await request(`https://tools.usps.com/go/TrackConfirmAction?tLabels=${data.trackCode}`)
				let $ = cheerio.load(html)
				let time = $('.time').text().trim().slice(0, -104).trim();
				expected = `${$('.date').text().trim()} ${$('.month_year').text().trim().slice(0, -150).trim()} ${time.slice(0, -2)} ${time.slice(time.length - 2, time.length)}`
			}
			//Get first and last events of given trackCode, assign a object and send it to Client
			let startEvent = parsedXML.TrackDetail.pop();
			let lastEvent = parsedXML.TrackSummary.EventDate._text + " " +parsedXML.TrackSummary.EventTime._text;
			body = {
				...data._doc,
				startDate: startEvent.EventDate._text + " " + startEvent.EventTime._text,
				lastDate: lastEvent,
				expected
			}
		}
		if(data.courier == 'fedEx'){
			const urlFedEx = `https://www.fedex.com/trackingCal/track?data={%22TrackPackagesRequest%22:{%22trackingInfoList%22:[{%22trackNumberInfo%22:{%22trackingNumber%22:%22${data.trackCode}%22}}]}}&action=trackpackages`
			let fedEx = await request(urlFedEx)
			body = {
				...data._doc,
				startDate: JSON.parse(fedEx).TrackPackagesResponse.packageList[0].shipDt,
				lastDate: JSON.parse(fedEx).TrackPackagesResponse.packageList[0].scanEventList[0].date + " " + JSON.parse(fedEx).TrackPackagesResponse.packageList[0].scanEventList[0].time,
				expected: JSON.parse(fedEx).TrackPackagesResponse.packageList[0].estDeliveryDt
			}
		}
		res.send(body)
	}catch(e){
		if(process.env.DEBUG =='true'){
			console.log('ERROR at /server/controllers/search.js, line: 41');
			console.log(e);
			console.log('==================================================================');
		}
		res.status(404).send(e)
	}
}

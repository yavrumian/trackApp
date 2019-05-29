const request = require('request-promise'),
	cheerio = require('cheerio'),
	convert = require('xml-js').xml2json;
const {TrackData} = require('../models/trackData'),
	{Technician} = require('../models/technician')

exports.search = async (req, res) => {
	let body;
	let startDate, expected, lastDate, status = 'delivered';
	let isTech = req.query.techIncluded;
	if(process.env.DEBUG =='true'){
		console.log(`AT: /server/controllers/search.js, line: 12 \nROUTE: /search\nREQUEST BODY:`)
		console.log(req.query);
		console.log('==================================================================');
	}
	try{
		block:{
			if (isTech) {
				//Find doc with given data, throw error if there's no doc
				let data = await Technician.findOne({name: req.query.partId}).populate('datas')
				if(!data){
					isTech = false
					break block;
				}
				data._doc.isTech = 'true';
				body = [data]
			}
		}
		if(!isTech){

			//Find doc with given data, throw error if there's no doc
			let data = await TrackData.findOne({partId: req.query.partId}).populate('techName')
			if(!data)
			throw {type: 'search-db', msg: "Invalid part ID"}
			if(data.delivered){
				startDate = data.startDate;
				lastDate = data.lastDate
			}else{
				if(data.courier == "USPS"){
					const urlUSPS =`http://production.shippingapis.com/ShippingApi.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22${process.env.USPS_ID}%22%3E%3CTrackID%20ID=%22${data.trackCode}%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E`
					//Make request to USPS with given data and parse it
					let usps = await request(urlUSPS);
					let parsedXML = JSON.parse(convert(usps, {compact: true, spaces: 4})).TrackResponse.TrackInfo;
					if(process.env.DEBUG =='true'){
						console.log(`AT: /server/controllers/search.js, line: 45 \nROUTE: /search\nREQUEST TO:${urlUSPS}\nRESPONSE: `)
						console.log('**Response\'s too long, uncomment line 47 to see it');
						//console.log(parsedXML);
						console.log('==================================================================');
					}
					//If is not delivered make request to get expected date
					if(!parsedXML.TrackSummary.Event._text.includes('Delivered')){
						status = 'not-delivered'
						let html = await request(`https://tools.usps.com/go/TrackConfirmAction?tLabels=${data.trackCode}`)
						let $ = cheerio.load(html)
						let time = $('.time').text().trim().slice(0, -104).trim();
						expected = `${$('.date').text().trim()} ${$('.month_year').text().trim().slice(0, -150).trim()} ${time.slice(0, -2)} ${time.slice(time.length - 2, time.length)}`
					}
					//If package is in pre-shipped stage send coresponding data
					if(parsedXML.TrackDetail.Event){
						if (parsedXML.TrackDetail.Event._text.includes('Pre-Shipment')) {
							status = 'pre'
						}
					}else{
						//Get first and last event, assign object
						startDate = parsedXML.TrackDetail.pop();
						if(startDate.Event._text.includes('Pre-Shipment'))
						startDate = parsedXML.TrackDetail.pop();
						startDate = startDate.EventDate._text + " " + startDate.EventTime._text
						lastDate = parsedXML.TrackSummary.EventDate._text + " " + parsedXML.TrackSummary.EventTime._text;
						//If is delivered add data to DB
						if(parsedXML.TrackSummary.Event._text.includes('Delivered')){
							data.startDate = startDate;
							data.lastDate = lastDate;
							data.delivered = new Date()
							await data.save()
						}
					}
				}
				if(data.courier == 'fedEx'){
					const urlFedEx = `https://www.fedex.com/trackingCal/track?data={%22TrackPackagesRequest%22:{%22trackingInfoList%22:[{%22trackNumberInfo%22:{%22trackingNumber%22:%22${data.trackCode}%22}}]}}&action=trackpackages`
					//make request to FedEx and parse it
					let fedEx = await request(urlFedEx)
					fedEx = JSON.parse(fedEx);
					if(process.env.DEBUG =='true'){
						console.log(`AT: /server/controllers/search.js, line: 85 \nROUTE: /search\nREQUEST TO:${urlFedEx}\nRESPONSE: `)
						console.log('**Response\'s too long, uncomment line 87 to see it');
						//console.log(fedEx);
						console.log('==================================================================');
					}
					status = 'delivered'
					startDate = fedEx.TrackPackagesResponse.packageList[0].shipDt;
					lastDate = fedEx.TrackPackagesResponse.packageList[0].scanEventList[0].date + " " + fedEx.TrackPackagesResponse.packageList[0].scanEventList[0].time;
					expected = fedEx.TrackPackagesResponse.packageList[0].estDeliveryDt
					//set status
					if(fedEx.TrackPackagesResponse.packageList[0].estDeliveryDt){
						status = 'not-delivered'
					}//If is delivered add data to DB
					else{
						data.startDate = startDate;
						data.lastDate = lastDate;
						data.delivered = new Date()
						await data.save()
					}
				}
				if(data.courier == 'DHL'){

					//Set options and make DHL request
					const dhlOpt =  {
						uri: 'https://api-eu.dhl.com/track/shipments?',
						qs: {
							trackingNumber: data.trackCode
						},
						headers: {
							 'DHL-API-Key': process.env.DHL_KEY
						},
						json: true
					}
					let dhl = await request(dhlOpt)
					dhl = dhl.shipments[0]
					if(process.env.DEBUG =='true'){
						console.log(`AT: /server/controllers/search.js, line: 121 \nROUTE: /search\nREQUEST TO:${dhlOpt.uri}\nRESPONSE: `)
						console.log('**Response\'s too long, uncomment line 123 to see it');
						//console.log(dhl);
						console.log('==================================================================');
					}
					//Parse response
					startDate = dhl.events.reverse()[1].timestamp
					lastDate = dhl.events.reverse()[0].timestamp

					//set status
					if(dhl.status.status != 'delivered'){
						status = 'not-delivered'
					}else if(dhl.status.status == 'delivered'){
						data.startDate = startDate;
						data.lastDate = lastDate;
						data.delivered = new Date()
						await data.save()
					}

				}
			}
			body = [{
				...data._doc,
				startDate,
				lastDate,
				expected,
				status
			}]
		}

		res.send(body)
	}catch(e){
		if(process.env.DEBUG =='true'){
			console.log('ERROR at /server/controllers/search.js, line: 154');
			console.log(e);
			console.log('==================================================================');
		}
		res.status(404).send(e)
	}
}

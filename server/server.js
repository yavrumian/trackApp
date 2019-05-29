const {mongoose} = require('./db/mongoose'),
	express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path');
const request = require('request-promise');


let options = {
	uri: 'https://api-eu.dhl.com/track/shipments?',
	qs: {
		trackingNumber: '6433451463'
	},
	headers: {
		 'DHL-API-Key': 'a8tIGK7oV8IHRGusxtAYtsu8UmeqftMY'
	},
	json: true
}

const app = express(),
	port = process.env.PORT;

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../public')))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use('/technician', require('./routers/technician'));
app.use('/trackData', require('./routers/trackData'));

app.get('/search', require('./controllers/search').search)
app.get('/allTech', require('./controllers/allTech').getAll)


app.get('/test', async (req, res) =>{
	console.log('test');

	try {
		let data = await request(options)
		res.send(data)
	} catch (e) {
		res.send(e)
	}


})


app.use(function(req, res, next) {
  return res.status(404).render('404.hbs', {url: req.url});
});

app.listen(port, () => {
	if(process.env.DEBUG == 'true'){
		console.log(`FROM: /server/server.js, line:24 \nPORT: ${port}\nMESSAGE: Server Started Succesfully`)
		console.log('==================================================================');
	}
})

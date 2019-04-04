const {mongoose} = require('./db/mongoose'),
	express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path')

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

app.use(function(req, res, next) {
  return res.status(404).render('404.hbs', {url: req.url});
});

app.listen(port, () => {
	if(process.env.DEBUG == 'true'){
		console.log(`FROM: /server/server.js, line:24 \nPORT: ${port}\nMESSAGE: Server Started Succesfully`)
		console.log('==================================================================');
	}
})

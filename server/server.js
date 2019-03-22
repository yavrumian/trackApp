const {mongoose} = require('./db/mongoose'),
	express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request-promise'),
	path = require('path'),
	axios = require('axios')
const app = express(),
	port = process.env.PORT,
	publicPath = path.join(__dirname, '../public');

app.set('view engine', 'hbs');
app.use(express.static(publicPath))
app.use(bodyParser.urlencoded());
app.use('/technician', require('./routers/technician'));
app.use('/trackData', require('./routers/trackData'));

app.get('/search', require('./controllers/search').search)
app.get('/all', require('./controllers/all').getAll)



app.post('/test', async (req, res) => {

	console.log(req.body);
	res.send('fedEx')

})
app.get('/html', (req, res) => {
	res.render('index.hbs')
})

app.use(function(req, res, next) {
  return res.status(404).send({ message: 'Route'+req.url+' Not found.' });
});

app.listen(port, () => {
	console.log(`Server Working on: ${port}`);
})

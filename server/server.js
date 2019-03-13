const {mongoose} = require('./db/mongoose'),
	express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request-promise'),
	cheerio = require('cheerio'),
	path = require('path')
const searchController = require('./controllers/search')
const app = express(),
	port = process.env.PORT,
	publicPath = path.join(__dirname, '../public');

app.set('view engine', 'hbs');
app.use(express.static(publicPath))
app.use(bodyParser.json());
app.use('/technician', require('./routers/technician'));
app.use('/trackData', require('./routers/trackData'));

app.get('/search', searchController.search)

app.get('/test', async (req, res) => {
	const fed = await request('https://www.fedex.com/apps/fedextrack/index.html?action=track&tracknumbers=gg527878765gsertgs')
	const $ = cheerio.load(fed)
	console.log($('.fxg-footer__social').html());
})
app.get('/html', (req, res) => {
	res.render('index.hbs')
})

app.listen(port, () => {
	console.log(`Server Working on: ${port}`);
})

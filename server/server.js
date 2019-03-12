const {mongoose} = require('./db/mongoose'),
	express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request')
const searchController = require('./controllers/search')
const app = express(),
	port = process.env.PORT

app.use(bodyParser.json());
app.use('/technician', require('./routers/technician'));
app.use('/trackData', require('./routers/trackData'));

app.get('/search', searchController.search)

app.listen(port, () => {
	console.log(`Server Working on: ${port}`);
})

const {mongoose} = require('./db/mongoose'),
	express = require('express'),
	bodyParser = require('body-parser')
const app = express(),
	port = process.env.PORT

app.use(bodyParser.json());
app.use('/technician', require('./routers/technician'));
app.use('/trackData', require('./routers/trackData'));

app.listen(port, () => {
	console.log(`Server Working on: ${port}`);
})

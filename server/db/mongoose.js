const mongoose = require('mongoose');
require('dotenv').config()

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports ={
	mongoose
}

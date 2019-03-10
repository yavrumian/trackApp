const mongoose = require('mongoose')
	Schema = mongoose.Schema;

const technicianSchema = new Schema({
	name: String
});

const Technician = mongoose.model('Technician', technicianSchema)

module.exports = {Technician}

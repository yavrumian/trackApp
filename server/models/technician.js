const mongoose = require('mongoose')
	Schema = mongoose.Schema;

const technicianSchema = new Schema({
	name: {type: String, unique: true}
});

const Technician = mongoose.model('Technician', technicianSchema)

module.exports = {Technician}

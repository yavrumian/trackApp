const router = require('express').Router(),
	controller = require('../controllers/technician')

router.post('/add', controller.addTechnician)

module.exports = router

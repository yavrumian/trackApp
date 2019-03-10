const router = require('express').Router(),
	controller = require('../controllers/trackData')

router.post('/add', controller.addTrack)

module.exports = router

const router = require('express').Router(),
	{check} = require('express-validator/check');

router.post('/add', check('name')
					.isLength({min: 3})
					.withMessage({type: 'tech-validation', text: 'Name must have at least 3 characters'}),
 require('../controllers/technician').addTechnician)

module.exports = router

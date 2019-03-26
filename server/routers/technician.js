const router = require('express').Router(),
	{check} = require('express-validator/check');

router.post('/add', check('name')
					.isLength({min:3})
					.withMessage({type: 'tech-validation', msg: 'Name can not be empty'}),
 require('../controllers/technician').addTechnician)

module.exports = router

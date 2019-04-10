const router = require('express').Router(),
	{check} = require('express-validator/check');
const controller = require('../controllers/technician');

router.post('/add', check('name')
					.isLength({min:3})
					.withMessage({type: 'tech-validation', msg: 'Name can not be empty'}),
 controller.addTechnician)

router.get('/delete/:id', controller.delete)

module.exports = router

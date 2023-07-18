const router = require('express').Router()
const OfficerController = require('../src/controllers/officer.controller')
const JobController = require('../src/controllers/job.controller')

router.use('/officers', OfficerController)
router.use('/jobs', JobController)

module.exports = router
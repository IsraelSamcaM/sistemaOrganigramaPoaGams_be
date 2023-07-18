const router = require('express').Router()
const OfficerController = require('../src/controllers/officer.controller')
const JobController = require('../src/controllers/job.controller')
const LevelController=require('../src/controllers/level.controller')


router.use('/officers', OfficerController)
router.use('/jobs', JobController)
router.use('/levels', LevelController)

module.exports = router
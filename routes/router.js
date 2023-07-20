const router = require('express').Router()
const OfficerController = require('../src/controllers/officer.controller')
const JobController = require('../src/controllers/job.controller')
const LevelController=require('../src/controllers/level.controller')
const JobdetailController=require('../src/controllers/jobdetail.controller')


router.use('/officers', OfficerController)
router.use('/jobs', JobController)
router.use('/levels', LevelController)
router.use('/levels', JobdetailController)
module.exports = router
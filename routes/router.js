const router = require('express').Router()
const OfficerController = require('../src/controllers/officer.controller')
const JobController = require('../src/controllers/job.controller')
const LevelController=require('../src/controllers/level.controller')
const JobdetailController=require('../src/controllers/jobdetail.controller')
const BudgetaryController=require('../src/controllers/budgetary.controller')
const DependenceController=require('../src/controllers/dependence.controller')
const RotationController=require('../src/controllers/rotation.controller')

router.use('/officers', OfficerController)
router.use('/jobs', JobController)
router.use('/levels', LevelController)  
router.use('/jobdetails', JobdetailController)
router.use('/Budgetarys', BudgetaryController)
router.use('/depedences', DependenceController)
router.use('/rotations', RotationController)
module.exports = router


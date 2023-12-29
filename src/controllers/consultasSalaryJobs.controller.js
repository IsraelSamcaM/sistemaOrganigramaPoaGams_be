const router = require('express').Router()
const { request, response, text } = require('express');
const consultasService = require('../services/consultsSalaryJobs.service')

router.get('/fullEventualesTable', async (req = request, res = response) => {
    try {
        const fullEventualesTable = await consultasService.getEventualFullTable()
        return res.status(200).json({
            ok: true,   
            fullEventualesTable   
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server - tabla de eventuales'
        })
    }
})
router.get('/totalGlobalEventuales', async (req = request, res = response) => {
    try {
        const globalSalariosItemTotal = await consultasService.getEventualesGlobalTotal()
        return res.status(200).json({
            ok: true,   
            globalSalariosItemTotal    
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})

router.get('/fullItemsTable', async (req = request, res = response) => {
    try {
        const fullItemsTable = await consultasService.getItemFullTable()
        return res.status(200).json({
            ok: true,   
            fullItemsTable   
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})
router.get('/totalGlobalItems', async (req = request, res = response) => {
    try {
        const globalSalariosItemTotal = await consultasService.getItemsGlobalTotal()
        return res.status(200).json({
            ok: true,   
            globalSalariosItemTotal    
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})

router.get('/fullSecretarias', async (req = request, res = response) => {
    try {
        const fullSalariosSecretarias = await consultasService.getFullSecretarias()
        return res.status(200).json({
            ok: true,   
            fullSalariosSecretarias
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})
router.get('/globalSecretarias', async (req = request, res = response) => {
    try {
        const globalSalariosSecretarias = await consultasService.getGlobalSecretarias()
        return res.status(200).json({
            ok: true,   
            globalSalariosSecretarias
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})

router.get('/fullPartidas', async (req = request, res = response) => {
    try {
        const fullSalariosPartidas = await consultasService.getFullPartidas()
        return res.status(200).json({
            ok: true,   
            fullSalariosPartidas
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})

router.get('/globalPartidas', async (req = request, res = response) => {
    try {
        const globalSalariosPartidas = await consultasService.getGlobalPartidas()
        return res.status(200).json({
            ok: true,   
            globalSalariosPartidas
        })  
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})

module.exports = router
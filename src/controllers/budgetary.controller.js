const router = require('express').Router()
const { request, response, text } = require('express');

const budgetaryService = require('../services/budgetary.service')

router.get('', async (req = request, res = response) => {
    try {
        const budgetarys = await budgetaryService.get()
        //console.log(budgetarys)
        return res.status(200).json({
            ok: true,   
            budgetarys
        })
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})
router.get('/:text', async (req = request, res = response) => {
    try {
        const budgetarys = await budgetaryService.search(req.params.text)
        return res.status(200).json({
            ok: true,
            budgetarys
        })
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})

router.get('/forjob/:text', async (req = request, res = response) => {
    try {
        const budgetarys = await budgetaryService.searchPartidaForJob(req.params.text)
        return res.status(200).json(budgetarys)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }   
})

router.put('/:id', async (req = request, res = response) => {
    try {
        const budgetarys = await budgetaryService.edit(req.params.id, req.body)
        return res.status(200).json(budgetarys)
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'  
        })
    }
})

router.post('', async (req = request, res = response) => {
    try {
        const budgetary = await budgetaryService.add(req.body)
        return res.status(200).json(budgetary)
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})

router.delete('/:id', async (req = request, res = response) => {
    try {
        const data = await budgetaryService.delete(req.params.id)
        return res.status(200).json(data)
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})


router.get('/search/:text', async (req = request, res = response) => {
    try {
        const budgetarys = await budgetaryService.searchWithText(req.params.text)
        return res.status(200).json({
            ok: true,   
            budgetarys
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})

router.get('/verification/:id', async (req = request, res = response) => {
    try {
        const existe = await budgetaryService.verificarDeshabilitacion(req.params.id)
        return res.status(200).json({
            ok: true,   
            existe
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})

module.exports = router
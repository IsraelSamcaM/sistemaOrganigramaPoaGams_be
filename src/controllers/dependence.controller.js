const router = require('express').Router()

const { request, response, text } = require('express');

const DependenceService = require('../services/dependence.service')

router.get('', async (req = request, res = response) => {
    try {
        const dependences = await DependenceService.get()
        return res.status(200).json({
            ok: true,   
            dependences
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
        const dependences = await DependenceService.search(req.params.text)
        return res.status(200).json({
            ok: true,
            dependences
        })
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})


router.put('/:id', async (req = request, res = response) => {
    try {
        const dependence = await DependenceService.edit(req.params.id, req.body)
        return res.status(200).json(dependence)
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
        const dependence = await DependenceService.add(req.body)
        return res.status(200).json(dependence)
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
        const data = await DependenceService.delete(req.params.id)
        return res.status(200).json(data)
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})

router.get('/search/dependence/:text', async (req = request, res = response) => {
    try {
        const dependences = await DependenceService.searchDependenceForDependence(req.params.text)
        return res.status(200).json(dependences)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }   
})

module.exports = router
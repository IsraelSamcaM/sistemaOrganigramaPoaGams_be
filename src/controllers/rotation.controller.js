const router = require('express').Router()
const { request, response, text } = require('express')
const rotationService = require('../services/rotation.service')
router.get('', async (req = request, res = response) => {
    try {
        const rotations = await rotationService.get()
        return res.status(200).json({
            ok: true,   
            rotations
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})
router.get('/:text', async (req = request, res = response) => {
    try {
        const rotations = await rotationService.search(req.params.text)
        return res.status(200).json({
            ok: true,
            rotations
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})

router.get('/rotation_fun/:text', async (req = request, res = response) => {
    try {
        const rotations = await rotationService.rotationFromOfficer(req.params.text)
        return res.status(200).json({
            ok: true,
            rotations
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,  
            message: 'Error in server'
        })
    }
})

router.get('/rotation_car/:text', async (req = request, res = response) => {
    try {
        const rotations = await rotationService.rotationFromJob(req.params.text)
        return res.status(200).json({
            ok: true,
            rotations
        })
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
        const rotations = await rotationService.edit(req.params.id, req.body)
        return res.status(200).json(rotations)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'  
        })
    }
})

router.post('', async (req = request, res = response) => {
    try {
        const rotation = req.body
        const newRotation = await rotationService.add(rotation)
        return res.status(200).json(newRotation)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})

router.delete('/:id', async (req = request, res = response) => {
    try {
        const rotation = await rotationService.delete(req.params.id)
        return res.status(200).json(rotation)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})
module.exports = router
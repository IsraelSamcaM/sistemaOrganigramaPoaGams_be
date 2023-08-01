const router = require('express').Router()
const { request, response, text } = require('express');

const levelService = require('../services/level.service')

router.get('', async (req = request, res = response) => {
    try {
        const levels = await levelService.get()
        return res.status(200).json({
            ok: true,   
            levels
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
        const levels = await levelService.search(req.params.text)
        return res.status(200).json({
            ok: true,
            levels
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
        const level = await levelService.edit(req.params.id, req.body)
        return res.status(200).json(level)
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
        const level = await levelService.add(req.body)
        return res.status(200).json(level)
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
        const data = await levelService.delete(req.params.id)
        return res.status(200).json(data)
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})


module.exports = router
const router = require('express').Router()
const { request, response } = require('express');

const funcionarioService = require('../services/officer.service')
router.get('', async (req = request, res = response) => {
    try {
        const officers = await funcionarioService.get()
        return res.status(200).json({
            ok: true,
            officers
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})
router.get('/search/:text', async (req = request, res = response) => {
    try {
        const officers = await funcionarioService.search(req.params.text)
        return res.status(200).json({
            ok: true,
            officers
        })
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
        const officer = await funcionarioService.add(req.body)
        return res.status(200).json(officer)
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
        const officer = await funcionarioService.edit(req.params.id, req.body)
        return res.status(200).json(officer)
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
        const data = await funcionarioService.delete(req.params.id)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})




module.exports = router
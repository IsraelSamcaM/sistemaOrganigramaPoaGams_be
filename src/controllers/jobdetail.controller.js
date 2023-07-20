const router = require('express').Router()
const { request, response, text } = require('express');

const jobdetailService = require('../services/jobdetail.service')

router.get('', async (req = request, res = response) => {
    try {
        const jobdetails = await jobdetailService.get()
        return res.status(200).json({
            ok: true,   
            jobdetails
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
        const jobdetails = await jobdetailService.search(req.params.text)
        return res.status(200).json({
            ok: true,
            jobdetails
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
        const jobdetail = await jobdetailService.edit(req.params.id, req.body)
        return res.status(200).json(jobdetail)
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
        const jobdetail = await jobdetailService.add(req.body)
        return res.status(200).json(jobdetail)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Error in server'
        })
    }
})


module.exports = router
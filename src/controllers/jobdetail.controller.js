const { request, response } = require('express');
const HttpStatus = require('http-status-codes');
const jobDetailService = require('../services/jobdetail.service');

/**
 * Obtiene todos los detalles de puestos de trabajo.
**/
exports.get = async (req, res) => {
  try {
    const jobDetails = await jobDetailService.get();
    return res.status(HttpStatus.OK).json({
      ok: true,
      jobDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error retrieving job details',
    });
  }
};

/**
 * Busca detalles de puestos de trabajo que coincidan con el texto proporcionado.
 * @param {request} req - El objeto de solicitud de Express.
 * @param {response} res - El objeto de respuesta de Express.
 */
exports.search = async (req, res) => {
  try {
    const jobDetails = await jobDetailService.search(req.params.text);
    if (jobDetails.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        ok: false,
        message: 'No job details found with the provided text',
      });
    }
    return res.status(HttpStatus.OK).json({
      ok: true,
      jobDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error searching job details',
    });
  }
};

/**
soy un cambio
 */
exports.add = async (req, res) => {
  try {
    const jobDetail = await jobDetailService.add(req.body);
    return res.status(HttpStatus.CREATED).json(jobDetail);
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error adding job',
    });
  }
};

/**
 * Actualiza un detalle de puesto de trabajo existente.
 * @param {request} req - El objeto de solicitud de Express.
 * @param {response} res - El objeto de respuesta de Express.
 */
exports.update = async (req, res) => {
  try {
    const jobDetail = await jobDetailService.edit(req.params.id, req.body);
    return res.status(HttpStatus.OK).json(jobDetail);
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error updating job detail',
    });
  }
};

module.exports = router;


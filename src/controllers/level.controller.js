const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const levelService = require('../services/level.service');

// Obtener todos los niveles
router.get('/', async (req, res) => {
  try {
    const levels = await levelService.get();
    return res.status(HttpStatus.OK).json({
      ok: true,
      levels,
    });
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error retrieving levels',
    });
  }
});

// Buscar niveles por texto
router.get('/:text', async (req, res) => {
  try {
    const levels = await levelService.search(req.params.text);
    if (levels.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        ok: false,
        message: 'No levels found with the provided text',
      });
    }
    return res.status(HttpStatus.OK).json({
      ok: true,
      levels,
    });
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error searching levels',
    });
  }
});

// Actualizar un nivel
router.put('/:id', async (req, res) => {
  try {
    const level = await levelService.edit(req.params.id, req.body);
    return res.status(HttpStatus.OK).json(level);
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error updating level',
    });
  }
});

// Agregar un nuevo nivel
router.post('/', async (req, res) => {
  try {
    const level = await levelService.add(req.body);
    return res.status(HttpStatus.CREATED).json(level);
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: 'Error adding level',
    });
  }
});

module.exports = router;

const { Schema, model } = require('mongoose')

const LevelSchema = Schema({
    nivel: {
        type: Number,
        required: true
    },
    sueldo: {
        type: Number,
        required: true
    },
    cajaSalud: {
        type: Number,
        required: true
    },                                                                     
    solidario: {
        type: Number,
        required: true
    },
    profecional: {
        type: Number,
        required: true
    },
    proVivienda: {
        type: Number,
        required: true
    },
   
})

LevelSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object
})

module.exports = model('niveles', LevelSchema)
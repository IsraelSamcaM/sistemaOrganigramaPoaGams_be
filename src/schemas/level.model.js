const { Schema, model } = require('mongoose')

const JobSchema = Schema({
    nivel: {
        type: Number,
        required: true
    },
    sueldo: {
        type: String,
        required: true
    },
    cajaSalud: {
        type: String,
        required: true
    },
    solidario: {
        type: String,
        required: true
    },
    profecional: {
        type: String,
        required: true
    },
    proVivienda: {
        type: String,
        required: true
    },
    
})

JobSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object
})

module.exports = model('niveles', JobSchema)
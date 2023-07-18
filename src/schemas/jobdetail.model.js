const { Schema, model } = require('mongoose')

const JobSchema = Schema({
    partidaPresupuestaria: {
        type: String,
        required: true
    },
    objetivoPuesto: {
        type: String,
        required: true
    },
    denominacionPuesto: {
        type: String,
        required: true
    },
    tipoGasto: {
        type: String,
        required: true
    },
    fuenteFinanciamiento: {
        type: Number,
        required: true
    },
    organismoFinanciador: {
        type: Number,
        required: true
    },
    duracionContrato: {
        type: Number,
        required: true
    },
    casos: {
        type: Number,
        required: true
    }
})

JobSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object;
})

module.exports = model('cargodetalle', JobScheme)
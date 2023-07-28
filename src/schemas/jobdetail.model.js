const { Schema, model } = require('mongoose')

const JobdetailSchema = Schema({
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

JobdetailSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object;
})

module.exports = model('cargosdetalles', JobdetailSchema)
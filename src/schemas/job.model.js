const { Schema, model } = require('mongoose')

const JobSchema = Schema({
    nombre: {
        type: String,
        required: true,
        uppercase: true
    },
    superior: {
        type: Schema.Types.ObjectId,
        ref: 'cargos',
        default: null
    },
    detalle_id:{
        type: Schema.Types.ObjectId,
        ref: 'cargosdetalles',
       
    },
    
    tipoContrato: {
        type: String,
        required: true,
        uppercase: true
    },
    estado: {
        type: String,
        required: true,
        uppercase: true
    },

    secretaria: {
        type: String,
        required: true,
        uppercase: true
    },

    isRoot: { type: Boolean, default: false },

    nivel_id:{
        type: Schema.Types.ObjectId,
        ref: 'niveles',
       
    },

    
})

JobSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object
})
module.exports = model('cargos', JobSchema)
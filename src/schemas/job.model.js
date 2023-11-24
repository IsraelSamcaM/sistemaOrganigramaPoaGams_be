const { Schema, model } = require('mongoose')

const JobSchema = Schema({
    nombre: {
        type: String,
        required: true,
        uppercase: true
    },

    denominacion: {
        type: String,
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

    duracion_contrato: {
        type: Number
    },

    isRoot: { 
        type: Boolean, 
        default: false  
    },

    nivel_id:{
        type: Schema.Types.ObjectId,
        ref: 'niveles'
    },

    partida_id:{
        type: Schema.Types.ObjectId,
        ref: 'partidas'
    },

    dependencia_id:{
        type: Schema.Types.ObjectId,
        ref: 'dependencias' 
    },  

    secretaria: {
        type: String,
        uppercase: true
    },
    jefatura: {
        type: String,
        uppercase: true
    },
    direccion: {    
        type: String,
        uppercase: true
    },
})


JobSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object
})
module.exports = model('cargos', JobSchema)
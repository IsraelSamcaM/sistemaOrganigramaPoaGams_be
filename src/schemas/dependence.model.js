const { Schema, model } = require('mongoose')

const DependenceModel = Schema({
    nombre: {
        type: String,
        required: true,
        uppercase: true
    },
    depende_de: {
        type: Schema.Types.ObjectId,
        ref: 'dependencias'
        
    }, 
    sigla: {
        type: String,
        required: true,
        uppercase: true
    },

    tipo: {
        type: String,
        required: true,
        uppercase: true
    },

    encargado: {
        type: Schema.Types.ObjectId,
        ref: 'cargos'
    }, 
    estado: {
        type: Boolean,
        required: true
    }
})

DependenceModel.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object
})
module.exports = model('dependencias', DependenceModel)
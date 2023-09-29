const { Schema, model } = require('mongoose')

const BudgetarySchema = Schema({
    codigo: {
        type: String,
        required: true,
        uppercase: true
    },
    nombrePartida: {
        type: String,
        required: true,
        uppercase: true
    },
    fuenteFinanciamiento:{
        type: Number,
        required: true
    },    
    organismoFinanciador: {
        type: Number,
        required: true, 
        uppercase: true
    },
    tipoGasto: {
        type: String,
        required: true, 
        uppercase: true
    },
    objetivo: {
        type: String,
        required: true, 
        uppercase: true
    },
    activo: {
        type: Boolean,
        required: true
    }  
})

BudgetarySchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object
})
module.exports = model('partidas', BudgetarySchema)
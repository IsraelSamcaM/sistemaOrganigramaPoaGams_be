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
    isRoot: { type: Boolean, default: false },

    nivel_id:{
        type: Schema.Types.ObjectId,
        ref: 'niveles',
       
    },

    detalle_id:{
        type: Schema.Types.ObjectId,
        ref: 'cargodetalle',
       
    }
})

JobSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject()
    return object
})
module.exports = model('cargos', JobSchema)
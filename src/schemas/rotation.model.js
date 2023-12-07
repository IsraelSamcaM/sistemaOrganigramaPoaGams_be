const { Schema, model } = require('mongoose');

const RotationSchema = Schema({
    cargo_id: {
        type: Schema.Types.ObjectId,
        ref: 'cargos',
        required: false
    },
    funcionario_id: {
        type: Schema.Types.ObjectId,
        ref: 'funcionarios',
        required: false
    },
    prueba: {
        type: String,
        uppercase: true,
    },
    fecha_rotacion: {
        type: String,
        uppercase: true,
        default: function() {
            const currentDate = new Date();
            return currentDate.toISOString().split('T')[0];
        }
    },
    hora_rotacion: {
        type: String,
        uppercase: true,
        default: function() {
            const currentDate = new Date();
            const hora = currentDate.toTimeString().split(' ')[0];
            return hora;
        }
    },
    
});

RotationSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model('rotaciones', RotationSchema);

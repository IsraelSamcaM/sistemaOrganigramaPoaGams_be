const { default: mongoose } = require('mongoose')

const RotationModel = require('../schemas/rotation.model')

exports.get = async () => {
    return await RotationModel.find({}).sort({ _id: -1 })
}

exports.search = async (text) => {
    const regex = new RegExp(text, 'i')
    return RotationModel.find({ fecha: regex })
}


exports.add = async (rotation) => {
    const createdRotation = new RotationModel(rotation) 
    const newRotation= await createdRotation.save()
    return newRotation
}

exports.edit = async (id_rotation, rotation) => {
    const newRotation = await RotationModel.findByIdAndUpdate8(id_rotation. rotation, {new: true})
    return newRotation
}

exports.delete = async (id_rotation) => {
    const rotationDB = await RotationModel.findById(id_rotation);
    if (!rotationDB) throw ({ status: 400, message: 'La rotacion no existe' });
    return await RotationModel.findByIdAndUpdate(id_rotation, { new: true })
}
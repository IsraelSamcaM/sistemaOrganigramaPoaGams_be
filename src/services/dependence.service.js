const { default: mongoose } = require('mongoose')

const DependenceModel  = require('../schemas/dependence.model')

exports.get = async () => {
return await DependenceModel.find({}).sort({ _id: -1 })
}

exports.search = async (text) => {
    const regex = new RegExp(text, 'i')
    return DependenceModel.find({ nombre: regex })
}


exports.add = async (dependence) => {
    const createdDependence= new DependenceModel(dependence)
    const newDependence= await createdDependence.save()
    return newDependence
}

exports.edit = async (id_dependence, dependence) => {
    const dependeceDB = await DependenceModel.findById(id_dependence)
    const newDependence = await DependenceModel.findByIdAndUpdate(id_dependence, dependence, { new: true })
    return newDependence
}

exports.delete = async (id_dependence) => {
    const dependeceDB = await DependenceModel.findById(id_dependence);
    if (!dependeceDB) throw ({ status: 400, message: 'La dependencia no existe' });
    return await DependenceModel.findByIdAndUpdate(id_dependence, { new: true })
}
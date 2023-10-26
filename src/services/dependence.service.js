const { default: mongoose } = require('mongoose')

const DependenceModel  = require('../schemas/dependence.model')

exports.get = async () => {
return await DependenceModel.find({}).sort({ _id: -1 }).populate('encargado').populate('depende_de')
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
    
    if (dependeceDB.depende_de && !dependence.depende_de) {
        await DependenceModel.findByIdAndUpdate(id_dependence, { $unset: { depende_de: 1 } })
    }
    if (dependeceDB.encargado && !dependence.encargado) {
        await DependenceModel.findByIdAndUpdate(id_dependence, { $unset: { encargado: 1 } })
    }
    const newDependence = await DependenceModel.findByIdAndUpdate(id_dependence, dependence, { new: true }).populate('encargado').populate('depende_de')
    return newDependence
}

exports.delete = async (id_dependence) => {
    const dependeceDB = await DependenceModel.findById(id_dependence);
    if (!dependeceDB) throw ({ status: 400, message: 'La dependencia no existe' });
    return await DependenceModel.findByIdAndUpdate(id_dependence, { new: true })
}

exports.searchDependenceForDependence = async (text) => {
    const regex = new RegExp(text, 'i')
    return await DependenceModel.aggregate([
        {
            $match: {
                nombre: regex
            }
        },
        { $limit: 5 }
    ])
}

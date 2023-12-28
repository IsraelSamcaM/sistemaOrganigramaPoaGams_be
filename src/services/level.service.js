const { default: mongoose } = require('mongoose')

const LevelModel = require('../schemas/level.model')

exports.get = async () => {
return await LevelModel.find({}).sort({ _id: 1 })
}

exports.search = async (text) => {
    const regex = new RegExp(text, 'i')
    return LevelModel.find({ nivel: regex })
}


exports.add = async (level) => {
    const createdLevel = new LevelModel(level)
    const newLevel= await createdLevel.save()
    return newLevel
}

exports.edit = async (id_level, level) => {
    const levelDB = await LevelModel.findById(id_level)
    const newLevel = await LevelModel.findByIdAndUpdate(id_level, level, { new: true })
    return newLevel
}

exports.delete = async (id_level) => {
    const levelDB = await LevelModel.findById(id_level);
    if (!levelDB) throw ({ status: 400, message: 'El nivel no existe' });
    return await LevelModel.findByIdAndUpdate(id_level, { new: true })
}
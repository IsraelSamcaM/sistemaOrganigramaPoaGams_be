const { default: mongoose } = require('mongoose')

const LevelModel = require('../schemas/level.model')

exports.get = async () => {
return await LevelModel.find({}).sort({ _id: -1 })
}
exports.search = async (text) => {
    const regex = new RegExp(text, 'i')
    return LevelModel.find({ nivel: regex })
}


exports.add = async (level) => {
    const createdLevel = new LevelModel(values)
    const newLevel= await createdLevel.save()
    return newLevel
}

exports.edit = async (id, job) => {
    const { dependents, ...values } = level
    return LevelModel.findByIdAndUpdate(id, values, { new: true })
}


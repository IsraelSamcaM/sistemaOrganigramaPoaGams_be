const { default: mongoose } = require('mongoose')
const JobDetailModel = require('../schemas/jobDetail.model')

exports.get = async () => {
return await JobdetailModel.find({}).sort({ _id: -1 })
}

exports.search = async (text) => {
    const regex = new RegExp(text, 'i')
    return JobdetailModel.find({ nombre: regex })
}


exports.add = async (level) => {
    const createdJobdetail = new JobdetailModel(values)
    const newJobdetail= await createdJobdetail.save()
    return newJobdetail
}

exports.edit = async (id, job) => {
    const { dependents, ...values } = level
    return JobdetailModel.findByIdAndUpdate(id, values, { new: true })
}

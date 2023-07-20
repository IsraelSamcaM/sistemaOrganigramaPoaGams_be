const { default: mongoose } = require('mongoose');
const JobDetailModel = require('../schemas/jobdetail.model');

exports.get = async () => {
  try {
    return await JobDetailModel.find({}).sort({ _id: -1 });
  } catch (error) {
    throw new Error('Error fetching job details: ' + error.message);
  }
};

exports.search = async (text) => {
  try {
    const regex = new RegExp(text, 'i');
    return await JobDetailModel.find({ denominacionPuesto: regex });
  } catch (error) {
    throw new Error('Error searching job details: ' + error.message);
  }
};

exports.add = async (jobDetail) => {
  try {
    const createdJobDetail = new JobDetailModel(jobDetail);
    const newJobDetail = await createdJobDetail.save();
    return newJobDetail;
  } catch (error) {
    throw new Error('Error adding job detail: ' + error.message);
  }
};

exports.edit = async (id, jobDetail) => {
  try {
    return await JobDetailModel.findByIdAndUpdate(id, jobDetail, { new: true });
  } catch (error) {
    throw new Error('Error editing job detail: ' + error.message);
  }
};

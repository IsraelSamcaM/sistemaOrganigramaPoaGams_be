const { default: mongoose } = require('mongoose');
const LevelModel = require('../schemas/level.model');

exports.get = async () => {
  try {
    return await LevelModel.find({}).sort({ _id: -1 });
  } catch (error) {
    throw new Error('Error fetching levels: ' + error.message);
  }
};

exports.search = async (text) => {
  try {
    const regex = new RegExp(text, 'i');
    return await LevelModel.find({ nombre: regex });
  } catch (error) {
    throw new Error('Error searching levels: ' + error.message);
  }
};

exports.add = async (level) => {
  try {
    const createdLevel = new LevelModel(level);
    const newLevel = await createdLevel.save();
    return newLevel;
  } catch (error) {
    throw new Error('Error adding level: ' + error.message);
  }
};

exports.edit = async (id, level) => {
  try {
    const { dependents, ...values } = level;
    return await LevelModel.findByIdAndUpdate(id, values, { new: true });
  } catch (error) {
    throw new Error('Error editing level: ' + error.message);
  }
};

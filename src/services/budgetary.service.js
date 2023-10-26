const { default: mongoose } = require('mongoose')

const BudgetaryModel = require('../schemas/budgetary.model')

exports.get = async () => {
return await BudgetaryModel.find({}).sort({ _id: -1 })
}

exports.search = async (text) => {
    const regex = new RegExp(text, 'i')
    return BudgetaryModel.find({ nombre: regex })
}

exports.add = async (budgetary) => {
    const createdBudgetary = new BudgetaryModel(budgetary)
    const newButgetary = await createdBudgetary.save()
    return newButgetary
}

exports.edit = async (id_budgetary, budgetary) => {
    const budgetaryDB = await BudgetaryModel.findById(id_budgetary)
    const newButgetary = await BudgetaryModel.findByIdAndUpdate(id_budgetary, budgetary, { new: true })
    return newButgetary
}

exports.delete = async (id_budgetary) => {
    const budgetaryDB = await BudgetaryModel.findById(id_budgetary);
    if (!budgetaryDB) throw ({ status: 400, message: 'La partida presupuestaria no existe' });
    return await BudgetaryModel.findByIdAndUpdate(id_budgetary, { new: true })
}

exports.searchPartidaForJob = async (text) => {
    const regex = new RegExp(text, 'i')
    return await BudgetaryModel.aggregate([
        {
            $match: {
                nombrePartida: regex
            }
        },
        { $limit: 5}
    ])
}
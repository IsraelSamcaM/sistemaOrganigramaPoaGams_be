const FuncionarioModel = require('../schemas/officer.model')

exports.get = async () => {
    return await FuncionarioModel.find({}).populate('cargo', 'nombre').sort({ _id: -1 })
}

exports.search = async (text) => {
    const regex = new RegExp(text, 'i')
    const dataPaginated = await FuncionarioModel.aggregate([
        {
            $lookup: {
                from: 'cargos',
                localField: "cargo",
                foreignField: "_id",
                as: "cargo"
            }
        },
        {
            $unwind: {
                path: "$cargo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                "fullname": {
                    $concat: [
                        "$nombre",
                        " ",
                        { $ifNull: ["$paterno", ""] },
                        " ",
                        { $ifNull: ["$materno", ""] },
                    ],
                },
            },
        },
        {
            $match: {
                $or: [
                    { 'fullname': regex },
                    { 'dni': regex },
                    { 'cargo.nombre': regex }
                ]
            }
        },
        { $sort: { _id: -1 } },

    ])
    return dataPaginated
}

exports.add = async (officer) => {
    const { dni } = officer
    const duplicate = await FuncionarioModel.findOne({ dni })
    if (duplicate) throw ({ status: 400, message: 'El dni introducido ya existe' });
    const createdOfficer = new FuncionarioModel(officer)
    const officerDB = await createdOfficer.save()
    await FuncionarioModel.populate(officerDB, { path: 'cargo', select: 'nombre' })
    return officerDB
}
exports.edit = async (id_funcionario, funcionario) => {
    const { dni } = funcionario
    const funcionarioDB = await FuncionarioModel.findById(id_funcionario)
    if (!funcionarioDB) {
        throw ({ status: 400, message: 'El funcionario no existe' });
    }
    if (funcionarioDB.dni !== dni) {
        const existeDni = await FuncionarioModel.findOne({ dni })
        if (existeDni) {
            throw ({ status: 400, message: 'El dni introducido ya existe' });
        }
    }
    if (funcionarioDB.cargo && !funcionario.cargo) {
        await FuncionarioModel.findByIdAndUpdate(funcionarioDB._id, { $unset: { cargo: 1 } })
    }
    const newFuncionario = await FuncionarioModel.findByIdAndUpdate(id_funcionario, funcionario, { new: true }).populate('cargo')
    return newFuncionario
}
exports.delete = async (id_officer) => {
    const officerDB = await FuncionarioModel.findById(id_officer);
    if (!officerDB) throw ({ status: 400, message: 'El funcionario no existe' });
    return await FuncionarioModel.findByIdAndUpdate(id_officer, { activo: !officerDB.activo }, { new: true })
}

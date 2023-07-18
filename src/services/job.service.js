    const { default: mongoose } = require('mongoose')
    const JobModel = require('../schemas/job.model')
    const OfficerModel = require('../schemas/officer.model')


    exports.get = async () => {
    return await JobModel.find({}).sort({ _id: -1 })
    }
    exports.search = async (text) => {
        const regex = new RegExp(text, 'i')
        return JobModel.find({ nombre: regex })
    }

    exports.searchJobForUser = async (text) => {
        const regex = new RegExp(text, 'i')
        return await JobModel.aggregate([
            {
                $lookup: {
                    from: "funcionarios",
                    localField: "_id",
                    foreignField: "cargo",
                    as: "funcionario"
                }
            },
            {
                $match: {
                    "funcionario": { $size: 0 },
                    nombre: regex
                }
            },
            { $limit: 5 },
            {
                $project: {
                    "funcionario": 0
                }
            }
        ])
    }

    exports.searchDependents = async (text) => {
        const regex = new RegExp(text, 'i')
        return await JobModel.find({ superior: null, isRoot: false, nombre: regex }).limit(5)
    }
    exports.getDependentsOfSuperior = async (idSuperior) => {
        return JobModel.find({ superior: idSuperior })
    }
    exports.removeDependent = async (idDependentJob) => {
        return JobModel.findByIdAndUpdate(idDependentJob, { superior: null })
    }

    exports.add = async (job) => {
        const { dependents, ...values } = job
        const createdJob = new JobModel(values)
        const newJob = await createdJob.save()
        for (const dependent of dependents) {
            await JobModel.findByIdAndUpdate(dependent, { superior: newJob._id })
        }
        return newJob
    }

    exports.edit = async (id, job) => {
        const { dependents, ...values } = job
        for (const dependent of dependents) {
            await JobModel.findByIdAndUpdate(dependent, { superior: id })
        }
        return JobModel.findByIdAndUpdate(id, values, { new: true })
    }


    exports.getOrganization = async () => {
        const data = await JobModel.aggregate([
            {
                $match: { isRoot: true },
            },
            {
                $graphLookup: {
                    from: 'cargos',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'superior',
                    as: 'organigram',
                },
            }
        ])
        for (const element of data) {
            const superiorOfficer = await OfficerModel.findOne({ cargo: element._id })
            element.officer = superiorOfficer
            for (const [index, dependents] of element.organigram.entries()) {
                const dependentOfficer = await OfficerModel.findOne({ cargo: dependents._id })
                
                element.organigram[index].officer = dependentOfficer
            }
        }
        return createOrgChartData(data);
    }
    const createOrgChartData = (data) => {
        const newData = data.map(el => {
            const newOrganigram = el.organigram.map(item => {
                return {
                    id: item._id,
                    pid: item.superior,
                    name: createFullName(item.officer),
                    img: 'https://cdn.balkan.app/shared/empty-img-white.svg',
                    title: item.nombre
                }
            })
            return {
                name: el.nombre,
                data: [{
                    id: el._id,
                    name: createFullName(el.officer),
                    img: 'https://cdn.balkan.app/shared/empty-img-white.svg',
                    title: el.nombre
                }, ...newOrganigram]
            }
        })
        return newData
    }

    const createFullName = (officer) => {
        if (!officer) return 'Sin funcionario'
        return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ");
    }

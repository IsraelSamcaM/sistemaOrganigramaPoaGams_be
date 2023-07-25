    const { default: mongoose } = require('mongoose')
    const JobModel = require('../schemas/job.model')
    const OfficerModel = require('../schemas/officer.model')
    const LevelModel = require('../schemas/level.model')


    exports.get = async () => {
    return await JobModel.find({}).sort({ _id: -1}).populate("nivel_id")
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
            },
            
        ])
        for (const element of data) {
            const superiorOfficer = await OfficerModel.findOne({ cargo: element._id })
            element.officer = superiorOfficer
            const nivelSuperiorOfficer = await LevelModel.findOne({ _id: element.nivel_id })
            element.nivel_id= nivelSuperiorOfficer
            for (const [index, dependents] of element.organigram.entries()) {
                const dependentOfficer = await OfficerModel.findOne({ cargo: dependents._id })
                const subNivel = await LevelModel.findOne({ _id: dependents.nivel_id })
                element.organigram[index].nivel_id = subNivel
            }
            
        }
        //console.log(data[0].organigram)
        const tagLevel=await LevelModel.find({}).select("nivel").sort({nivel:1})
        let tags ={}
        tagLevel.forEach(element => {
            tags["subLevels"+element.nivel] = {subLevels: element.nivel}

        });
        //console.log(tags)
        return  { organigrama:createOrgChartData(data),tags:tags}
    }
    const createOrgChartData = (data) => {
        
        const aux=data

        const newData = data.map(el => {
            
            const newOrganigram = el.organigram.map(item => {
               let levelSuperior = aux.find(sup=>sup._id.toString()===item.superior.toString())
               //let levelSuperior = aux.find(sup => sup._id.equals(item.superior));

                if(levelSuperior){
                    console.log(levelSuperior.nivel_id)
                }
                levelSuperior= levelSuperior?levelSuperior.nivel_id.nivel:item.nivel_id.nivel
                
                const nivelReal = item.nivel_id.nivel-levelSuperior;
               
                return {
                    id: item._id,
                    pid: item.superior,
                    name: createFullName(item.officer),
                    //img: 'https://cdn.balkan.app/shared/empty-img-white.svg',
                    title: item.nombre,
                    tags: ["subLevels"+nivelReal],
                    nivel: item.nivel_id.nivel
                }
            })
            return {
                name: el.nombre,
                tags: ["subLevels"+el.nivel_id.nivel],
                data: [{
                    id: el._id,
                    name: createFullName(el.officer),
                    //img: 'https://cdn.balkan.app/shared/empty-img-white.svg',
                    title: el.nombre,
                    nivel: el.nivel_id.nivel

                }, ...newOrganigram]
            }
        })
        return newData
    }

    const createFullName = (officer) => {
        if (!officer) return 'Sin funcionario'
        return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ");
    }

    exports.getJoinLevel = async () => {
        try {
          const job = await JobModel.aggregate([
            {
              $lookup: {
                from: 'niveles', 
                localField: 'nivel_id',
                foreignField: '_id',
                as: 'nivel'
              } 
            },
            {
              $unwind: '$nivel'
            }
          ]);
      
          if (job.length === 0) {
            throw new Error('Job not found');
          }
      
          return job[0];
        } catch (error) {
          throw new Error('Error getting job with level: ' + error.message);
        }
    }

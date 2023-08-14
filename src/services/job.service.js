    const { default: mongoose } = require('mongoose')
    const JobDetailModel = require('../schemas/jobDetail.model')
    const JobModel = require('../schemas/job.model')
    const OfficerModel = require('../schemas/officer.model')
    const LevelModel = require('../schemas/level.model')


    exports.get = async () => {
    const data =await JobModel.find({tipoContrato: "CONTRATO"}).sort({ _id: -1}).populate('detalle_id').populate('nivel_id')
    //console.log(data)
    return await JobModel.find({}).sort({ _id: -1}).populate("nivel_id").populate("detalle_id")
    }
    
    exports.search = async (text) => {
        const regex = new RegExp(text, 'i')
        return JobModel.find({ nombre: regex }).populate("nivel_id")
    }
    
    /*             todo completo de la tabla  de items          */
    exports.getItemFullTable= async () => {
        const data = await JobModel.aggregate([
          {
            $match: {
              tipoContrato: "ITEM",
              estado: { $ne: "ELIMINACION" }
            }
          },
          {
            $lookup: {
              from: "niveles",
              localField: "nivel_id", 
              foreignField: "_id",
              as: "nivel"
            }
          },
          {
            $unwind: "$nivel"
          },
          {
            $project: {
              _id: 0,
              nombre: 1,
              tipoContrato: 1,
              nivel: "$nivel.nivel",
              sueldoMensual: "$nivel.sueldo",
              sueldoAnual: { $multiply: ["$nivel.sueldo", 12] },
              Aguinaldo: "$nivel.sueldo",
              CNS: { $multiply: ["$nivel.sueldo", "$nivel.cajaSalud", 12] },
              AporteSolidario:  { $multiply: ["$nivel.sueldo", "$nivel.solidario", 12]  },
              AFP: { $multiply: ["$nivel.sueldo", "$nivel.profecional", 12]  },
              proVivienda: { $multiply: ["$nivel.sueldo", "$nivel.proVivienda", 12] }
            }
          },
          {
            $addFields: {
              TotalAportes: { $sum: ["$CNS", "$AporteSolidario", "$AFP", "$proVivienda"]}
            }
          },
          {
            $addFields: {
              Total: { $sum: ["$sueldoAnual", "$Aguinaldo", "$TotalAportes"] }
            }
          }
        ]);
      return data;    
  }

    
  exports.getEscalaSalarial= async () => {
        const data = await JobModel.aggregate([
                {
                  $match: {
                    tipoContrato: "ITEM",
                    estado: { $ne: "ELIMINACION" }  
                  }
                },
                {
                  $lookup: {
                    from: "niveles",
                    localField: "nivel_id",
                    foreignField: "_id",
                    as: "nivelInfo"
                  }
                },
                {
                  $unwind: "$nivelInfo"
                },
                {
                  $group: {
                    _id: "$nivelInfo.nivel",
                    cantidadCargos: { $sum: 1 },
                    totalSueldoMensual: { $sum: "$nivelInfo.sueldo" },
                    sueldoBase: { $first: "$nivelInfo.sueldo" }
                  }
                },
                {
                  $project: {
                    _id: 1,
                    cantidadCargos: 1,
                    totalSueldoMensual: 1,
                    sueldoBase: 1,
                    totalSueldoAnual: { $multiply: ["$totalSueldoMensual", 12] }
                  }
                },
                {
                  $sort: {
                    _id: 1
                  }
                }
              ])
        
        //console.log(data)
        return data

    }
    
    exports.getTotalEscalaSalarial = async () => {
        const data = await JobModel.aggregate([
              {
                $match: {
                  tipoContrato: "ITEM",
                  estado: { $ne: "ELIMINACION" }
                }
              },
              {
                $lookup: {
                  from: "niveles",
                  localField: "nivel_id",
                  foreignField: "_id",
                  as: "nivelInfo"
                }
              },
              {
                $unwind: "$nivelInfo"
              },
              {
                $group: {
                  _id: "$nivelInfo.nivel",
                  totalSueldoMensual: { $sum: "$nivelInfo.sueldo" },
                  totalSueldoAnual: { $sum: { $multiply: ["$nivelInfo.sueldo", 12] } },
                  cantidadCargos: { $sum: 1 },
                  sueldoBase: { $first: "$nivelInfo.sueldo" }
                }
              },
              {
                $group: {
                  _id: null,
                  totalSueldo: { $sum: "$sueldoBase" },
                  totalSueldoMensual: { $sum: "$totalSueldoMensual" },
                  totalSueldoAnual: { $sum: "$totalSueldoAnual" },
                  totalCantidadCargos: { $sum: "$cantidadCargos" },
                  totalCantidadNiveles: { $sum: 1 }
                }
              },
              {
                $project: {
                  _id: 0,
                  totalSueldo: 1,
                  totalSueldoMensual: 1,
                  totalSueldoAnual: 1,
                  totalCantidadCargos: 1,
                  totalCantidadNiveles: 1
                }
              }
            ])
          //console.log(data)
          return data
    }

    //retorna por partida presupuestaria
    exports.getEscalaSalarialPartidaPresupuestaria = async () => {
      const data = await JobModel.aggregate([
            {
              $match: {
                tipoContrato: "CONTRATO",
                estado: { $ne: "ELIMINACION" }
              }
            },
            {
              $lookup: {
                from: "cargosdetalles",
                localField: "detalle_id",
                foreignField: "_id",
                as: "detalleInfo"
              }
            },
            {
              $lookup: {
                from: "niveles",
                localField: "nivel_id",
                foreignField: "_id",
                as: "nivelInfo"
              }
            },
            {
              $unwind: "$detalleInfo"
            },
            {
              $unwind: "$nivelInfo"
            },
            {
              $group: {
                _id: "$detalleInfo.partidaPresupuestaria",
                cantidadCargos: { $sum: 1 },
                totalSueldos: { $sum: "$nivelInfo.sueldo" }
              }
            },
            {
              $project: {
                _id: 0,
                partidaPresupuestaria: "$_id",
                cantidadCargos: 1,
                totalSueldos: 1,
                aguinaldo: "$totalSueldos",
                aportes: {$multiply: ["$totalSueldos", 12, 0.1671]},
                totalSueldoAnual: { $multiply: ["$totalSueldos", 12] }
              }
            },
            {
              $addFields: {
                total: { $sum: ["$aguinaldo", "$aportes", "$totalSueldoAnual"] }
              }
            }
          ])
        //console.log(data)
        return data
  }

  //retorna por el total global de eventuales partida presupuestaria
  exports.getEscalaSalarialPartidaPresupuestariaTotal = async () => {
        const data = await JobModel.aggregate([
            {
              $match: {
                tipoContrato: "CONTRATO",
                estado: { $ne: "ELIMINACION" }
              }
            },
            {
              $lookup: {
                from: "cargosdetalles",
                localField: "detalle_id",
                foreignField: "_id",
                as: "detalleInfo"
              }
            },
            {
              $lookup: {
                from: "niveles",
                localField: "nivel_id",
                foreignField: "_id",
                as: "nivelInfo"
              }
            },
            {
              $unwind: "$detalleInfo"
            },
            {
              $unwind: "$nivelInfo"
            },
            {
              $group: {
                _id: null,
                totalSueldos: { $sum: "$nivelInfo.sueldo" },
                totalAguinaldos: { $sum: "$nivelInfo.sueldo" },
                totalAportes: { $sum:{ $multiply: ["$nivelInfo.sueldo", 12, 0.1671] }},
                totalCostoAnual: { $sum: { $multiply: ["$nivelInfo.sueldo", 12] } },
                cantidadCargos: { $sum: 1 },
              }
            },
            {
              $addFields: {
                totalAportesRedondeado:"$totalAportes"  
              }
            },
            {
              $project: {
                _id: 0,
                totalSueldos: 1,
                totalAguinaldos: 1,
                totalAportes: 1,
                totalCostoAnual: 1,
                cantidadCargos: 1,
                totalAportesRedondeado: 1,
                total: { $sum: [ "$totalAguinaldos", "$totalAportesRedondeado", "$totalCostoAnual"] }
              }
            }
          ])
          //console.log(data)
          return data
    }

    
  //retorna por el total global de items 
  exports.getItemsGlobalTotal = async () => {
    const data = await JobModel.aggregate([
      {
        $match: {
          tipoContrato: "ITEM",
          estado: { $ne: "ELIMINACION" }
        }
      },
      {
        $lookup: {
          from: "niveles",
          localField: "nivel_id",
          foreignField: "_id",
          as: "nivel"
        }
      },
      {
        $unwind: "$nivel"
      },
      {
        $project: {
          _id: 0,
          nombre: 1,
          tipoContrato: 1,
          nivel: "$nivel.nivel",
          sueldoMensual: "$nivel.sueldo",
          sueldoAnual: { $multiply: ["$nivel.sueldo", 12] },
          Aguinaldo: "$nivel.sueldo",
          CNS: { $multiply: ["$nivel.sueldo", "$nivel.cajaSalud",12] },
          AporteSolidario: { $multiply: ["$nivel.sueldo", "$nivel.solidario",12] },
          AFP:{ $multiply: ["$nivel.sueldo" ,12, "$nivel.profecional"]},
          proVivienda: { $multiply: ["$nivel.sueldo", "$nivel.proVivienda",12]  }
        }
      },
      {
        $addFields: {
          TotalAportes: { $sum: ["$CNS", "$AporteSolidario", "$AFP", "$proVivienda"]}
        }
      },
      {
        $addFields: {
          Total:{$sum: ["$sueldoAnual", "$Aguinaldo", "$TotalAportes"] }
        }
      },
      {
        $group: {
          _id: null,
          TotalSueldoMensual: { $sum: "$sueldoMensual" },
          TotalSueldoAnual: { $sum: "$sueldoAnual" },
          TotalAguinaldo: { $sum: "$Aguinaldo" },
          TotalCNS: { $sum: "$CNS" },
          TotalAporteSolidario: { $sum: "$AporteSolidario" },
          TotalAFP: { $sum: "$AFP" },
          TotalProVivienda: { $sum: "$proVivienda" },
          TotalAportes: { $sum: "$TotalAportes" },
          TotalTotal: { $sum: "$Total" },
          TotalItems: { $sum: 1 } 
        }
      }
    ]);
      //console.log(data)
      return data
  }

    
  //retorna por el total global por secretarias 
  exports.getGlobalSecretaria = async () => {
          const data = await JobModel.aggregate([
            {
              $match: {
                estado: { $ne: "ELIMINACION" }
              }
            },
            {
              $lookup: {
                from: "niveles",
                localField: "nivel_id",
                foreignField: "_id",
                as: "nivelInfo"
              }
            },
            {
              $unwind: "$nivelInfo"
            },
            {
              $group: {
                _id: "$secretaria",
                cantidadCargos: { $sum: 1 },
                totalSueldos: { $sum: "$nivelInfo.sueldo" },
                cantidadItem: {
                  $sum: {
                    $cond: [{ $eq: ["$tipoContrato", "ITEM"] }, 1, 0]
                  }
                },
                cantidadContrato: {
                  $sum: {
                    $cond: [{ $eq: ["$tipoContrato", "CONTRATO"] }, 1, 0]
                  }
                }
              }
            },
            {
              $project: {
                _id: 1,
                cantidadCargos: 1,
                totalSueldos: 1,
                aguinaldos: "$totalSueldos",
                aportes: { $multiply: ["$totalSueldos", 12, 0.1671]},
                totalSueldoAnual: { $multiply: ["$totalSueldos", 12] },
                cantidadItem: 1,
                cantidadContrato: 1
              }
            },
            {
              $addFields: {
                total: { $sum: ["$aguinaldos", "$aportes", "$totalSueldoAnual"] }
              }
            }
          ])
          //console.log(data)
          return data
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

    exports.add = async (job,jobDetail) => {
        const { dependents, ...values } = job
        if(job.tipoContrato == 'CONTRATO'){
          const createdJobDetail = new JobDetailModel(jobDetail)
          const newJobdetail = await createdJobDetail.save()
          values.detalle_id = newJobdetail._id 
        }
        const createdJob = new JobModel(values)
        const newJob = await createdJob.save()
        for (const dependent of dependents) {
            await JobModel.findByIdAndUpdate(dependent, { superior: newJob._id })
        }

        return newJob
    }

    exports.edit = async (id, job,jobDetail) => {
        //console.log(job)
        const { dependents, ...values } = job  
        for (const dependent of dependents) {
            await JobModel.findByIdAndUpdate(dependent, { superior: id })   
        }
        const updateJob = await JobModel.findByIdAndUpdate(id, values, { new: true }).populate("nivel_id")
        if(updateJob.tipoContrato == 'CONTRATO'){
         await JobDetailModel.findByIdAndUpdate(updateJob.detalle_id, jobDetail, { new: true })
        }
        return await updateJob.populate('detalle_id') 
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
        
        const aux = data
       
        data.forEach((element, i) => {
            element.organigram.forEach((element2, y) => {
                
                let levelSuperior = element.organigram.find(sup=>sup._id.toString()==element2.superior.toString())
                
                if(levelSuperior!=undefined ){
                    // console.log("funcionario actual ",data[i].organigram[y].nombre,"nivel ", data[i].organigram[y].nivel_id.nivel)
                    // console.log("funcionario superior ",levelSuperior.nombre,"nivel ", levelSuperior.nivel_id.nivel)
                    // console.log("nuevo nivel nivel ", element2.nivel_id.nivel-levelSuperior.nivel_id.nivel)
                    data[i].organigram[y].levelReal=element2.nivel_id.nivel
                    
                    data[i].organigram[y].nivel_id.nivel=element2.nivel_id.nivel-levelSuperior.nivel_id.nivel
                
                    //console.log(data[i].organigram[y])
                }
            });          
        });
        data.forEach((element, i) => {
            element.organigram.forEach((element2, y) => {
              //console.log(element2)
                
            });          
        });

                
        
        const newData = data.map(el => {    

            const newOrganigram = el.organigram.map(item => {       
                               
                return {
                    id: item._id,
                    pid: item.superior,
                    name: createFullName(item.officer),
                    //img: 'https://cdn.balkan.app/shared/empty-img-white.svg',
                    title: item.nombre,
                    tags: ["subLevels"+item.nivel_id.nivel],
                    nivel: item.levelReal,
                    estado: item.estado
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
                    nivel: el.nivel_id.nivel,
                    estado: el.estado
    
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

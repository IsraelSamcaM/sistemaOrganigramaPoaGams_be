    const { default: mongoose } = require('mongoose')
    const JobDetailModel = require('../schemas/jobDetail.model')
    const JobModel = require('../schemas/job.model')
    const OfficerModel = require('../schemas/officer.model')
    const LevelModel = require('../schemas/level.model')


    exports.get = async () => {
      const data =await JobModel.find({tipoContrato: "CONTRATO"}).sort({ _id: -1}).populate('detalle_id').populate('nivel_id').populate("superior").populate('partida_id')
      //console.log(data)
      //console.log(data)
      return await JobModel.find({}).sort({ _id: -1}).populate("nivel_id").populate("detalle_id").populate("superior").populate('partida_id')
      //console.log(data) 
    }

    exports.getNoOrganigram = async () => {
      const data =await JobModel.find({$and: [{isRoot: false},{superior: null}]}).sort({ _id: -1}).populate('detalle_id').populate('nivel_id').populate('partida_id')
      //console.log(data)
      return data
    }
    
    exports.searcFullCombo = async (level, estado) => {    
      const query = {};
      
      if (estado === "habilitado") {
        query.estado = { $ne: "ELIMINACION" };
      } else if (estado === "deshabilitado") {
        query.estado = "ELIMINACION";
      }
    
      if (level !== "noneLevel") {
        query.nivel_id = level;
      }
    
      const populates = ["nivel_id", "detalle_id"];
      const consult = JobModel.find(query).populate(populates).populate("superior");
    
      return consult;
    }

    exports.search = async (level) => {    
      if(level == "noneLevel"){
          consult = JobModel.find({$and:[{}]} ).populate("nivel_id").populate("detalle_id").populate("superior")  
      }else{
        consult = JobModel.find({$and:[{nivel_id:level}]} ).populate("nivel_id").populate("detalle_id")
      }
      return consult  
  }

    exports.searchWithText  = async (text) =>{
      const regex = new RegExp(text, 'i');
      const dataPaginated = await JobModel.aggregate([
          {
              $match: {
                  $or: [
                      { 'nombre': regex },
                      { 'secretaria': regex }
                  ]
              }
          },
          {
            $lookup: {
                from: 'niveles', 
                localField: 'nivel_id', 
                foreignField: '_id', 
                as: 'nivel_id' 
            }
          },
          {
            $unwind: {
                path: "$nivel_id",
              
            }
          },
          { $sort: { _id: -1 } }
      ]);
      return dataPaginated;
    } 
    
    /*       todo completo de la tabla  de items      */
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

  
/*   todo completo de la tabla  de eventuales    */
  exports.getEventualFullTable = async () => {
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
          as: "detalle"
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
        $unwind: "$detalle"
      },
      {
        $unwind: "$nivel"
      },
      {
        $project: {
          _id: 0,
          partidaPresupuestaria: "$detalle.partidaPresupuestaria",
          objetivoPuesto: "$detalle.objetivoPuesto",
          secretaria: 1,
          nivel: "$nivel.nivel",
          denominacionPuesto: "$detalle.denominacionPuesto",
          nombre: 1,
          tipoContrato: 1,
          estado: 1,
          sueldoMensual: "$nivel.sueldo",
          tipoGasto: "$detalle.tipoGasto",
          fuenteFinanciamiento: "$detalle.fuenteFinanciamiento",
          organismoFinanciador: "$detalle.organismoFinanciador",
          duracionContrato: "$detalle.duracionContrato",
          casos: "$detalle.casos",
          sueldoAnual: { $multiply: ["$nivel.sueldo", 12] },
          Aguinaldo: "$nivel.sueldo",
          CNS: { $multiply: ["$nivel.sueldo", "$nivel.cajaSalud", 12] },
          AporteSolidario: { $multiply: ["$nivel.sueldo", "$nivel.solidario", 12] },
          AFP: { $multiply: ["$nivel.sueldo", "$nivel.profecional", 12] },
          proVivienda: { $multiply: ["$nivel.sueldo", "$nivel.proVivienda", 12] }
        }
      },
      {
        $addFields: {
          TotalAportes: { $sum: ["$CNS", "$AporteSolidario", "$AFP", "$proVivienda"] }
        }
      },
      {
        $addFields: {
          Total: { $sum: ["$sueldoAnual", "$Aguinaldo", "$TotalAportes"] }
        }
      }
    ]);
    //console.log(data)
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

    exports.add = async (job) => {
      console.log(job)
      const { dependents, ...values } = job

      const createdJob = new JobModel(values)
      const newJob = await createdJob.save()
      for (const dependent of dependents) {
        await JobModel.findByIdAndUpdate(dependent, { superior: newJob._id })
      }
      await JobModel.populate(newJob,'nivel_id').populate(newJob,'partida_id')
      return newJob
    }

    exports.edit = async (id, job) => {
      const { dependents, ...values } = job
      const jobDB = await JobModel.findById(id)
      for (const dependent of dependents) {
        await JobModel.findByIdAndUpdate(dependent, { superior: id })
      }
      if (jobDB.tipoContrato === 'CONTRATO' && job.tipoContrato === 'ITEM') {
        await JobDetailModel.findByIdAndDelete(jobDB.detalle_id)
      }
      
      if (jobDB.superior && !job.superior) {
        await JobModel.findByIdAndUpdate(jobDB._id, { $unset: { superior: 1 } })
      }
      return await JobModel.findByIdAndUpdate(id, job, { new: true }).populate("nivel_id").populate("superior").populate('partida_id')
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
                element.organigram[index].officer = dependentOfficer
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
        //console.log(data)
        return  { organigrama:createOrgChartData2(data),tags:tags}
    }
    
    exports.getOrganization2 = async () => {
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
      return  { organigrama:createOrgChartData2(data),tags:tags}
    }

    const createOrgChartData = (data) => {
        
        const aux = data
        
        data.forEach((element, i) => {
            element.organigram.forEach((element2, y) => {               
            });          
        });
        const newData = data.map(el => {    
            const newOrganigram = el.organigram.map(item => {                    
                return {
                    id: item._id,
                    pid: item.superior,
                    name: createFullName(item.officer),
                    //img: 'https://cdn.balkan.app/shared/empty-img-white.svg',
                    //title: item.nombre,
                    title: createNameJob(item.nombre , item.tipoContrato),
                    tags: ["subLevels"+item.nivel_id.nivel],
                    nivel: ["Nivel: "+item.nivel_id.nivel],
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
                    //title: el.nombre,
                    title: createNameJob(el.nombre , el.tipoContrato),
                    nivel: ["Nivel: "+el.nivel_id.nivel],
                    estado: el.estado
    
                }, ...newOrganigram]
            }
        })
        //console.log(newData)
        return newData
    }

    const createOrgChartData2 = (data) => {
        
      data.forEach((element, i) => {
          element.organigram.forEach((element2, y) => {               
          });          
      });
      const newData = data.map(el => {    
          const newOrganigram = el.organigram.map(item => {                    
              return {
                  id: item._id,
                  pid: item.superior,
                  name: createFullName(item.officer),
                  title: createNameJob(item.nombre , item.tipoContrato),
                  nivel: "Nivel: "+item.nivel_id.nivel,
                  estado: item.estado,
                  backgroundColor: asignarColor(item.estado),
              }
          })
          return {  
              name: el.nombre,
              data: [{
                  id: el._id,
                  name: createFullName(el.officer),
                  title: createNameJob(el.nombre , el.tipoContrato),
                  nivel: "Nivel: "+el.nivel_id.nivel,
                  estado: el.estado,
                  backgroundColor: asignarColor(el.estado),
  
              }, ...newOrganigram]
          }
      })
      //console.log(newDatA)
      return newData
  }

    
    const createFullName = (officer) => {
        if (!officer) return 'Sin funcionario'
        return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ");
    }


    const createNameJob = (nombre, tipoContrato) => {
      if (tipoContrato == 'CONTRATO') return nombre + " (C)"
      return nombre
    }

    const asignarColor = (estado) => {
      const colores = {
        'EVENTUAL': "#93CDDD",
        'ITEM': "#DDE2CD",
        'ASCENSO': "#B7FD71",
        'CREACION': "#799540",
        'REUBICACION': "#FFFF00",
        'DESCENSO': "#F2DCDA",
        'DENOMINACION': "#ff8000",
        'ELIMINACION': "#F58B82 "
      };
      return colores[estado] || "#000000";
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

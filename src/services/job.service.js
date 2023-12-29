const { default: mongoose } = require('mongoose')
const JobDetailModel = require('../schemas/jobDetail.model')
const JobModel = require('../schemas/job.model')
const OfficerModel = require('../schemas/officer.model')
const LevelModel = require('../schemas/level.model')
const officerModel = require('../schemas/officer.model')


  exports.get = async () => {
      const data = await JobModel.find({}).sort({ _id: -1 }).populate("nivel_id").populate("detalle_id").populate("superior").populate('partida_id').populate('dependencia_id');
      
      const dataFuncionarios = await OfficerModel.find({}).sort({ _id: -1 }).populate('cargo');  
      const resultados = [];
      for (const cargo of data) {
        const funcionario = dataFuncionarios.find(f => f.cargo && f.cargo.equals(cargo._id)); 
        const resultado = {
          ...cargo.toObject(),
          funcionario: funcionario ? `${funcionario.nombre} ${funcionario.paterno} ${funcionario.materno}` : 'Sin funcionario',
        };
        resultados.push(resultado);
      }
      return resultados;
  } 

  exports.getJobsAndLevels = async () => {
    const data = await JobModel.find({}).sort({ _id: -1 })
  } 

  exports.edit = async (id, job) => {
    console.log(job);
    const { dependents, ...values } = job;

    if (job.partida_id === '') {
      delete values.partida_id;}
    if (job.duracion_contrato) {
      values.duracion_contrato = parseInt(values.duracion_contrato)}
    if (job.denominacion === '') {
      delete values.denominacion;}
    if (job.superior === '') {
      delete values.superior;}

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

    return await JobModel.findByIdAndUpdate(id, values, { new: true }).populate("nivel_id").populate("superior").populate('partida_id').populate('dependencia_id')
  }
  
  exports.getNoOrganigram = async () => {
      const data =await JobModel.find({$and: [{isRoot: false},{superior: null}]}).sort({ _id: -1}).populate('detalle_id').populate('nivel_id').populate('partida_id')
      return data
  }
    
  exports.searcFullCombo = async (level, estado) => {    
      const query = {};
      if (estado === "habilitado") {
        query.estado = { $ne: "ELIMINACION" };
      } else if (estado === "deshabilitado") {
        query.estado = "ELIMINACION";
      } else if (estado === "ascenso") {
        query.estado = "ASCENSO";
      } else if (estado === "creacion") {
        query.estado = "CREACION";
      } else if (estado === "reubicacion") {
        query.estado = "REUBICACION";
      } else if (estado === "descenso") {
        query.estado = "DESCENSO";
      }else if (estado === "denominacion") {
        query.estado = "DENOMINACION";
      }

      if (level !== "noneLevel") {
        query.nivel_id = level;
      }
      const populates = ["nivel_id", "detalle_id"];
      const data = await JobModel.find(query).populate(populates).populate("superior");
      const dataFuncionarios = await OfficerModel.find({}).sort({ _id: -1 }).populate('cargo');  
      const resultados = [];
      for (const cargo of data) {
        const funcionario = dataFuncionarios.find(f => f.cargo && f.cargo.equals(cargo._id)); 
        const resultado = {
          ...cargo.toObject(),
          funcionario: funcionario ? `${funcionario.nombre} ${funcionario.paterno} ${funcionario.materno}` : 'Sin funcionario',
        };
        resultados.push(resultado);
      }
      return resultados;
  }

  exports.search = async (level) => {    
      if(level == "noneLevel"){
          consult = JobModel.find({$and:[{}]} ).populate("nivel_id").populate("detalle_id").populate("superior")  
      }else{
        consult = JobModel.find({$and:[{nivel_id:level}]} ).populate("nivel_id").populate("detalle_id")
      }
      return consult  
  }

  exports.searchWithText = async (text) => {
      const regex = new RegExp(text, 'i');
      const data = await JobModel.aggregate([
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

      const dataFuncionarios = await OfficerModel.find({}).sort({ _id: -1 }).populate('cargo');  
      const resultados = [];
      for (const cargo of data) {
        const funcionario = dataFuncionarios.find(f => f.cargo && f.cargo.equals(cargo._id)); 
        const resultado = {
          ...cargo,
          funcionario: funcionario ? `${funcionario.nombre} ${funcionario.paterno} ${funcionario.materno}` : 'Sin funcionario',
        };
        resultados.push(resultado);
      }
      return resultados;
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
                from: "partidas",
                localField: "partida_id",
                foreignField: "_id",
                as: "partidas"
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
              $unwind: "$partidas"
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
      console.log(job);
      const { dependents, ...values } = job;
      if (job.partida_id === '') {
        delete values.partida_id;
      }
      if (job.duracion_contrato === '') {
        delete values.duracion_contrato;
      }
      if (job.denominacion === '') {
        delete values.denominacion;
      }
      if (job.superior === '') {
        delete values.denominacion;
      }
     


      const createdJob = new JobModel(values);
      const newJob = await createdJob.save();
      for (const dependent of dependents) {
        await JobModel.findByIdAndUpdate(dependent, { superior: newJob._id });
      }
      const populatedJob = await JobModel.findById(newJob._id).populate('nivel_id').populate('partida_id').populate('dependencia_id').exec();
      return populatedJob;
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




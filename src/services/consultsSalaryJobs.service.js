const { default: mongoose } = require('mongoose')

const LevelModel = require('../schemas/level.model')
const JobModel = require('../schemas/job.model')

//-----------------------------------------------------//
// Tabla de Distribucion Personal y Sueldos Eventuales //
//-----------------------------------------------------//
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
          from: "partidas",
          localField: "partida_id",
          foreignField: "_id",
          as: "partida"
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
        $unwind: "$partida"
      },
      {
        $unwind: "$nivel"
      },
      {
        $project: {
          _id: 0,
          partidaPresupuestaria: "$partida.nombrePartida",
          objetivoPuesto: "$partida.objetivo",
          secretaria: 1,
          nivel: "$nivel.nivel",

          denominacion: 1,

          nombre: 1,
          tipoContrato: 1,
          estado: 1,
          sueldoMensual: "$nivel.sueldo",
          tipoGasto: "$partida.tipoGasto",
          fuenteFinanciamiento: "$partida.fuenteFinanciamiento",
          organismoFinanciador: "$partida.organismoFinanciador",
          
          duracion_contrato: 1,
          //ya no hay casos

          sueldoAnual: { $multiply: ["$nivel.sueldo", "$duracion_contrato"] },
          Aguinaldo: "$nivel.sueldo",
          CNS: { $multiply: ["$nivel.sueldo", "$nivel.cajaSalud", "$duracion_contrato"] },
          AporteSolidario: { $multiply: ["$nivel.sueldo", "$nivel.solidario", "$duracion_contrato"] },
          AFP: { $multiply: ["$nivel.sueldo", "$nivel.profecional", "$duracion_contrato"] },
          proVivienda: { $multiply: ["$nivel.sueldo", "$nivel.proVivienda", "$duracion_contrato"] }
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
    return data;
}
//-----------------------------------------------------//
exports.getEventualesGlobalTotal = async () => {
    const data = await JobModel.aggregate([
      {
        $match: {
          tipoContrato: "CONTRATO",
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
          sueldoAnual: { $multiply: ["$nivel.sueldo", "$duracion_contrato"] },
          Aguinaldo: "$nivel.sueldo",
          CNS: { $multiply: ["$nivel.sueldo", "$nivel.cajaSalud","$duracion_contrato"] },
          AporteSolidario: { $multiply: ["$nivel.sueldo", "$nivel.solidario","$duracion_contrato"] },
          AFP:{ $multiply: ["$nivel.sueldo" ,"$duracion_contrato", "$nivel.profecional"]},
          proVivienda: { $multiply: ["$nivel.sueldo", "$nivel.proVivienda","$duracion_contrato"]  }
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

//-----------------------------------------------------//
//    Tabla de Distribucion Personal y Sueldos Items   //
//-----------------------------------------------------//
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
//-----------------------------------------------------//
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
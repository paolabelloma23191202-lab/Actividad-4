// Tarea 4 - Big Data UNAD - Caso 1: Netflix (Silvia Paola Bello Macias)
// Ejecutar en mongosh o MongoDB Compass (MONGOSH)

// ==================== CREACIÓN DE LA BASE Y DATOS DE PRUEBA ====================

use("netflix");
db.dropDatabase();

const paises = ["Colombia", "México", "Argentina", "España", "Estados Unidos", "Chile"];
const planes = ["Básico", "Estándar", "Premium"];
const dispositivos = ["Televisor", "Celular", "Computador", "Tablet"];
const clasif = ["TV-MA", "TV-14", "TV-PG", "PG-13", "R"];
const generosBase = ["Drama", "Comedia", "Acción", "Suspenso", "Ciencia ficción",
    "Documental", "Romance"];
const catalogo = [
  ["Stranger Things", "Serie"], ["The Crown", "Serie"], ["Narcos", "Serie"],
  ["Dark", "Serie"], ["Ozark", "Serie"], ["Bridgerton", "Serie"],
  ["Squid Game", "Serie"], ["Wednesday", "Serie"], ["The Witcher", "Serie"],
  ["Lupin", "Serie"], ["Elite", "Serie"], ["Black Mirror", "Serie"],
  ["Mindhunter", "Serie"], ["Our Planet", "Serie"], ["Making a Murderer", "Serie"],
  ["Cobra Kai", "Serie"], ["Heartstopper", "Serie"], ["Sweet Tooth", "Serie"],
  ["Arcane", "Serie"], ["The Umbrella Academy", "Serie"],
  ["Roma", "Película"], ["The Irishman", "Película"], ["Bird Box", "Película"],
  ["Extraction", "Película"], ["Enola Holmes", "Película"], ["Red Notice", "Película"],
  ["Don't Look Up", "Película"], ["Glass Onion", "Película"], ["The Gray Man", "Película"],
  ["El Camino", "Película"]
];
const azar = (n) => Math.floor(Math.random() * n);

const titulos = [];
catalogo.forEach(([nombre, tipo], i) => {
  const t = { _id: i + 1, titulo: nombre, tipo: tipo,
      generos: [...new Set([generosBase[azar(7)], generosBase[azar(7)]])],
      anioLanzamiento: 2010 + azar(16), pais: paises[azar(6)],
      clasificacion: clasif[azar(5)],
      calificacion: Number((6 + Math.random() * 3.9).toFixed(1)) };
  if (tipo === "Película") t.duracionMin = 80 + azar(90);
  else t.temporadas = azar(6) + 1;
  titulos.push(t);
});
db.titulos.insertMany(titulos);

const suscriptores = [];
for (let i = 1; i <= 30; i++) {
  suscriptores.push({ _id: i, nombre: "Suscriptor " + i,
      email: "suscriptor" + i + "@correo.com", pais: paises[i % 6], plan: planes[i % 3],
      fechaRegistro: new Date(2024, i % 12, (i % 27) + 1) });
}
db.suscriptores.insertMany(suscriptores);

const visualizaciones = [];
for (let i = 1; i <= 120; i++) {
  visualizaciones.push({ _id: i, suscriptorId: azar(30) + 1, tituloId: azar(30) + 1,
      fecha: new Date(2026, azar(10), azar(27) + 1), minutosVistos: azar(150) + 5,
      dispositivo: dispositivos[azar(4)], calificacion: azar(5) + 1 });
}
db.visualizaciones.insertMany(visualizaciones);

// ==================== CONSULTAS BÁSICAS (INSERTAR, SELECCIONAR, ACTUALIZAR, ELIMINAR) ====================

// INSERTAR
db.titulos.insertOne({ _id: 31, titulo: "Título de prueba", tipo: "Película",
    generos: ["Drama"], anioLanzamiento: 2026, pais: "Colombia", clasificacion: "TV-14",
    calificacion: 7.5, duracionMin: 110 });

// SELECCIONAR
db.titulos.find({ tipo: "Serie" });
db.titulos.findOne({ _id: 5 });

// ACTUALIZAR
db.titulos.updateOne({ _id: 31 }, { $set: { calificacion: 8.2 } });
db.suscriptores.updateMany({ plan: "Básico" }, { $set: { conAnuncios: true } });

// ELIMINAR
db.titulos.deleteOne({ _id: 31 });
db.visualizaciones.deleteMany({ minutosVistos: { $lt: 10 } });

// ==================== CONSULTAS CON FILTROS Y OPERADORES ====================

db.titulos.find({ tipo: "Película", calificacion: { $gte: 8 } });
db.titulos.find({ generos: "Drama", anioLanzamiento: { $gt: 2018 } });
db.titulos.find({ clasificacion: { $in: ["TV-MA", "R"] } },
    { titulo: 1, clasificacion: 1, _id: 0 });
db.visualizaciones.find({ $or: [{ dispositivo: "Celular" }, { minutosVistos: { $gt: 120 } }] });
db.titulos.find().sort({ calificacion: -1 }).limit(5);

// ==================== JOIN CON $LOOKUP ====================

// Visualizaciones con el título y el suscriptor
db.visualizaciones.aggregate([
  { $lookup: { from: "titulos", localField: "tituloId", foreignField: "_id", as: "titulo" } },
  { $unwind: "$titulo" },
  { $lookup: { from: "suscriptores", localField: "suscriptorId", foreignField: "_id",
      as: "suscriptor" } },
  { $unwind: "$suscriptor" },
  { $project: { _id: 0, "titulo.titulo": 1, "suscriptor.nombre": 1, "suscriptor.plan": 1,
      minutosVistos: 1 } },
  { $limit: 10 }
]);

// ==================== AGREGACIONES (CONTAR, SUMAR, PROMEDIAR) ====================

// Cantidad de títulos por tipo
db.titulos.aggregate([{ $group: { _id: "$tipo", cantidad: { $sum: 1 } } }]);

// Calificación promedio por tipo
db.titulos.aggregate([{ $group: { _id: "$tipo", promedio: { $avg: "$calificacion" } } }]);

// Minutos totales y promedio por visualización
db.visualizaciones.aggregate([{ $group: { _id: null, minutosTotales: { $sum: "$minutosVistos" },
    promedioMinutos: { $avg: "$minutosVistos" } } }]);

// Los 5 títulos más vistos
db.visualizaciones.aggregate([
  { $group: { _id: "$tituloId", vistas: { $sum: 1 }, minutos: { $sum: "$minutosVistos" } } },
  { $sort: { vistas: -1 } }, { $limit: 5 },
  { $lookup: { from: "titulos", localField: "_id", foreignField: "_id", as: "t" } },
  { $unwind: "$t" },
  { $project: { _id: 0, titulo: "$t.titulo", vistas: 1, minutos: 1 } }
]);

// Minutos vistos por plan de suscripción
db.visualizaciones.aggregate([
  { $lookup: { from: "suscriptores", localField: "suscriptorId", foreignField: "_id", as: "s" } },
  { $unwind: "$s" },
  { $group: { _id: "$s.plan", minutos: { $sum: "$minutosVistos" },
      visualizaciones: { $sum: 1 } } },
  { $sort: { minutos: -1 } }
]);

// Visualizaciones por género
db.visualizaciones.aggregate([
  { $lookup: { from: "titulos", localField: "tituloId", foreignField: "_id", as: "t" } },
  { $unwind: "$t" },
  { $unwind: "$t.generos" },
  { $group: { _id: "$t.generos", visualizaciones: { $sum: 1 } } },
  { $sort: { visualizaciones: -1 } }
]);

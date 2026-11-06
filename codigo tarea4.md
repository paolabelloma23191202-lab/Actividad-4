# Tarea 4 - Big Data (UNAD) - Caso Netflix

Base de datos **netflix** en MongoDB con 3 colecciones:
- `titulos` (30 documentos)
- `suscriptores` (30 documentos)
- `visualizaciones` (120 documentos)

Total: 180 documentos de prueba.

## Cómo usarlo
1. Abrir MongoDB Compass y conectarse a `mongodb://localhost:27017`.
2. Abrir la consola **MONGOSH** (parte de abajo).
3. Copiar y pegar el contenido de `consultas_netflix.js`, o correr `mongosh consultas_netflix.js`.

El archivo trae: creación de datos, consultas básicas (insertar, seleccionar, actualizar, eliminar), filtros y operadores, `$lookup` (join) y agregaciones (contar, sumar, promediar).

**Autora:** Silvia Paola Bello Macias - Big Data, Grupo 202016911_114

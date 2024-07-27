const express = require('express');
const { conexionMysql } = require('./db/conexionDB');
const variables = require('./utils/variables');
const { configuracionSeguridad } = require('./security/configuracionSeguridad');

const app = express();

const PORT = variables.EXPRESS_PORT;
const HOST = variables.EXPRESS_HOST;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configuracionSeguridad(app);

conexionMysql()
    .then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`Escuchando por el servidor http://${HOST}:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error al conectar a la base de datos: ", err);
        process.exit();
    });
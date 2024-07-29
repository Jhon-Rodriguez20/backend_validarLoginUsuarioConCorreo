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
        app.listen(PORT, HOST, () => {});
    })
    .catch(() => {
        process.exit();
    });
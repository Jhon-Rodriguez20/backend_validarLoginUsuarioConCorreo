const mysql = require('mysql2/promise');
const variables = require('../utils/variables');

const pool = mysql.createPool({
    host: variables.MYSQL_HOST,
    user: variables.MYSQL_USER,
    password: variables.MYSQL_PASSWORD,
    database: variables.MYSQL_DB
})

const conexionMysql = async () => {
    try {
        const connection = await pool.getConnection();
        connection.release();

        return connection;

    } catch (error) {
        console.error("Error al conectar a la base de datos: ", error);
        throw error;
    }
}

module.exports = { conexionMysql }
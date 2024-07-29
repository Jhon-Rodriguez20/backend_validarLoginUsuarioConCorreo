const conexion = require('../conexionDB.js');

const crear = async (usuario) => {
    const connection = await conexion.conexionMysql();
    await connection.beginTransaction();

    try {
        const query = "INSERT INTO usuario SET ?";
        await connection.query(query, usuario);
        await connection.commit();

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

const leerUsuarioLogin = async (email) => {
    const connection = await conexion.conexionMysql();
    const query = "SELECT * FROM usuario WHERE email = ?";
    const [rows] = await connection.query(query, [email]);
    connection.release();
    return rows[0];
}

const leerUsuarioPorEmail = async (email) => {
    const connection = await conexion.conexionMysql();
    const query = `
        SELECT
            idUsuario,
            nombre,
            email,
            intentosEnvio,
            verificado,
            bloqueadoHasta
        FROM usuario
        WHERE email = ?
    `;
    const [rows] = await connection.query(query, [email]);
    connection.release();
    return rows[0];
}

const leerUsuario = async (idUsuario) => {
    const connection = await conexion.conexionMysql();
    const query = `
        SELECT
            idUsuario,
            nombre,
            email,
            intentosEnvio,
            verificado,
            bloqueadoHasta
        FROM usuario
        WHERE idUsuario = ?
    `;
    const [rows] = await connection.query(query, [idUsuario]);
    connection.release();
    return rows[0];
}

const crearCodigo = async (codigoVerificacion) => {
    const connection = await conexion.conexionMysql();
    await connection.beginTransaction();
    try {
        const query = "INSERT INTO usuarioCodigoVerificacion SET ?";
        await connection.query(query, codigoVerificacion);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

const obtenerCodigoMasReciente = async (idUsuario) => {
    const connection = await conexion.conexionMysql();
    const query = "SELECT * FROM usuarioCodigoVerificacion WHERE idUsuario = ? ORDER BY expiracion DESC LIMIT 1";
    const [rows] = await connection.query(query, [idUsuario]);
    connection.release();
    return rows[0];
}

const verificarUsuario = async (idUsuario, verificado) => {
    const connection = await conexion.conexionMysql();
    const query = "UPDATE usuario SET verificado = ?, intentosEnvio = 0, bloqueadoHasta = NULL WHERE idUsuario = ?";
    await connection.query(query, [verificado, idUsuario]);
    connection.release();
}

const eliminarCodigo = async (idUsuario) => {
    const connection = await conexion.conexionMysql();
    const query = "DELETE FROM usuarioCodigoVerificacion WHERE idUsuario = ?";
    await connection.query(query, [idUsuario]);
    connection.release();
}

const eliminarCodigosPrevios = async (idUsuario) => {
    const connection = await conexion.conexionMysql();
    const query = "DELETE FROM usuarioCodigoVerificacion WHERE idUsuario = ?";
    await connection.query(query, [idUsuario]);
    connection.release();
}

const actualizarIntentosEnvio = async (idUsuario, intentosEnvio, bloqueadoHasta = null) => {
    const connection = await conexion.conexionMysql();
    const query = `
        UPDATE usuario
        SET intentosEnvio = ?, bloqueadoHasta = ?
        WHERE idUsuario = ?
    `;
    await connection.query(query, [intentosEnvio, bloqueadoHasta, idUsuario]);
    connection.release();
}

const eliminarUsuario = async (idUsuario) => {
    const connection = await conexion.conexionMysql();
    await connection.beginTransaction();

    try {
        const query = "DELETE FROM usuario WHERE idUsuario = ?";
        await connection.query(query, [idUsuario]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {crear, leerUsuarioLogin, leerUsuario, crearCodigo, leerUsuarioPorEmail,
    obtenerCodigoMasReciente, verificarUsuario, eliminarCodigo, eliminarCodigosPrevios, actualizarIntentosEnvio, eliminarUsuario
}
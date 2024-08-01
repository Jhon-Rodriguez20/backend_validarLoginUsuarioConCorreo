const usuarioRepositorio = require('../db/repositorios/usuarioRepositorio');
const { UsuarioEntity } = require('../models/UsuarioModelo');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const enviarCodigoVerificacion = require('../utils/enviarCodigoVerificacion');

const crearUsuario = async (usuario) => {
    if (!usuario.nombre || !usuario.email || !usuario.password) {
        throw new Error("Datos vacíos o incorrectos");
    }

    const usuarioExistente = await usuarioRepositorio.leerUsuarioPorEmail(usuario.email);
    if (usuarioExistente) {
        if (usuarioExistente.verificado) {
            throw new Error("El correo ya fue registrado.");
        } else {
            await enviarCodigoVerificacion(usuarioExistente.idUsuario, usuarioExistente.email, usuarioExistente.intentosEnvio + 1);
            return usuarioExistente;
        }
    }

    usuario.idUsuario = uuidv4();
    usuario.passwordEncp = bcrypt.hashSync(usuario.password, 10);
    usuario.verificado = false;
    usuario.intentosEnvio = 0;

    await usuarioRepositorio.crear(new UsuarioEntity(usuario));
    await enviarCodigoVerificacion(usuario.idUsuario, usuario.email, 1);

    return await usuarioRepositorio.leerUsuario(usuario.idUsuario);
}

const leerUsuarioLogin = async (email) => {
    const usuario = await usuarioRepositorio.leerUsuarioLogin(email);
    
    if (!usuario || !usuario.verificado) throw new Error("Usuario no verificado o no encontrado.");
    return usuario;
}

const verificarCodigo = async (idUsuario, codigo) => {
    const codigoVerificacion = await usuarioRepositorio.obtenerCodigoMasReciente(idUsuario);

    if (!codigoVerificacion || codigoVerificacion.codigo !== codigo || Date.now() > codigoVerificacion.expiracion) {
        if (codigoVerificacion && Date.now() > codigoVerificacion.expiracion) {
            await usuarioRepositorio.eliminarUsuario(idUsuario);
        }
        throw new Error("Código inválido o ha expirado");
    }
    await usuarioRepositorio.eliminarCodigo(idUsuario);

    await usuarioRepositorio.verificarUsuario(idUsuario, true);
    return true;
}

const solicitarRecuperacionContrasena = async (email) => {
    const usuario = await usuarioRepositorio.leerUsuarioPorEmail(email);
    if (!usuario) throw new Error("El correo no está registrado. Por favor, inténtalo nuevamente.");
    await enviarCodigoVerificacion(usuario.idUsuario, email, usuario.intentosEnvio + 1);
}

const verificarCodigoRecuperacion = async (email, codigo) => {
    const usuario = await usuarioRepositorio.leerUsuarioPorEmail(email);
    if (!usuario) throw new Error("El correo no se encuentra.");

    const codigoVerificacion = await usuarioRepositorio.obtenerCodigoMasReciente(usuario.idUsuario);
    if (!codigoVerificacion || codigoVerificacion.codigo !== codigo || Date.now() > codigoVerificacion.expiracion) {
        throw new Error("Código inválido o ha expirado");
    }

    await usuarioRepositorio.eliminarCodigo(usuario.idUsuario);
    return usuario.idUsuario;
}

const actualizarContrasena = async (idUsuario, nuevaContrasena) => {
    const nuevaContrasenaEncp = bcrypt.hashSync(nuevaContrasena, 10);
    await usuarioRepositorio.actualizarContrasena(idUsuario, nuevaContrasenaEncp);
}

module.exports = {crearUsuario, leerUsuarioLogin, enviarCodigoVerificacion, verificarCodigo,
    solicitarRecuperacionContrasena, verificarCodigoRecuperacion, actualizarContrasena
}
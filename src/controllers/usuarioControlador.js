const respuestasHttp = require('../utils/respuestasHttp');
const usuarioServicio = require('../services/usuarioServicio');
const { UsuarioDatosResModel, UsuarioCrearReqModel } = require('../models/UsuarioModelo');

const postUsuario = async (req, res) => {
    try {
        const usuario = await usuarioServicio.crearUsuario(new UsuarioCrearReqModel(req.body));
        res.status(201).json({ mensaje: 'Usuario creado y código de verificación enviado', usuarioEntity: new UsuarioDatosResModel(usuario) });
    } catch (err) {
        res.status(400).json({ mensaje: 'Error al crear el usuario', error: err.message });
    }
}

const postVerificarCodigo = async (req, res) => {
    const { idUsuario, codigo } = req.body;
    try {
        await usuarioServicio.verificarCodigo(idUsuario, codigo);
        res.status(200).json({ mensaje: 'Usuario verificado correctamente' });
    } catch (err) {
        res.status(400).json({ mensaje: 'Error al verificar el código', error: err.message });
    }
}

const postSignin = (req, res) => {
    if (!req.user.error) {
        respuestasHttp.signin(req, res, "", 200);
    } else {
        res.status(404).json({ mensaje: 'Credenciales incorrectas. Por favor, vuelve a intentarlo' });
    }
}

const postSolicitarRecuperacion = async (req, res) => {
    try {
        await usuarioServicio.solicitarRecuperacionContrasena(req.body.email);
        res.status(200).json({ mensaje: 'Código de verificación enviado' });
    } catch (err) {
        res.status(400).json({ mensaje: 'Error al solicitar la recuperación de contraseña', error: err.message });
    }
}

const postVerificarCodigoRecuperacion = async (req, res) => {
    const { email, codigo } = req.body;
    try {
        const idUsuario = await usuarioServicio.verificarCodigoRecuperacion(email, codigo);
        res.status(200).json({ mensaje: 'Código verificado correctamente', idUsuario });
    } catch (err) {
        res.status(400).json({ mensaje: 'Error al verificar el código', error: err.message });
    }
}

const postActualizarContrasena = async (req, res) => {
    const { idUsuario, nuevaContrasena } = req.body;
    try {
        await usuarioServicio.actualizarContrasena(idUsuario, nuevaContrasena);
        res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (err) {
        res.status(400).json({ mensaje: 'Error al actualizar la contraseña', error: err.message });
    }
}

module.exports = { postUsuario, postSignin, postVerificarCodigo,
    postSolicitarRecuperacion, postVerificarCodigoRecuperacion, postActualizarContrasena
}
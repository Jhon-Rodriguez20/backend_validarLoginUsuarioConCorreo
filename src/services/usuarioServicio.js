const usuarioRepositorio = require('../db/repositorios/usuarioRepositorio');
const { UsuarioEntity, UsuarioCodigoVerificacionEntity } = require('../models/UsuarioModelo');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
    
    if (!usuario || !usuario.verificado) {
        throw new Error("Usuario no verificado o no encontrado.");
    }
    return usuario;
}

const enviarCodigoVerificacion = async (idUsuario, email, intentosEnvio) => {
    const usuario = await usuarioRepositorio.leerUsuario(idUsuario);
    
    const ahora = new Date();
    if (usuario.bloqueadoHasta && ahora < new Date(usuario.bloqueadoHasta)) {
        throw new Error("Has alcanzado el límite de intentos. Intenta nuevamente más tarde.");
    }

    // Resetear intentos de envío si el bloqueo ha expirado
    if (usuario.bloqueadoHasta && ahora >= new Date(usuario.bloqueadoHasta)) {
        intentosEnvio = 1; // Reiniciar el contador de intentos
    } else if (intentosEnvio > 3) {
        const bloqueadoHasta = new Date(ahora.getTime() + 30 * 60 * 1000); // 30 minutos
        await usuarioRepositorio.actualizarIntentosEnvio(idUsuario, intentosEnvio, bloqueadoHasta);
        throw new Error("Has alcanzado el límite de intentos. Intenta nuevamente en 30 minutos.");
    }

    const codigo = crypto.randomInt(100000, 999999).toString();
    const expiracion = Date.now() + 10 * 60 * 1000; // 10 minutos

    const codigoVerificacion = new UsuarioCodigoVerificacionEntity({ idUsuario, codigo, expiracion });
    await usuarioRepositorio.eliminarCodigosPrevios(idUsuario); // Elimina los códigos previos antes de crear el nuevo
    await usuarioRepositorio.crearCodigo(codigoVerificacion);

    await usuarioRepositorio.actualizarIntentosEnvio(idUsuario, intentosEnvio);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'xanderrap020713@gmail.com', // Asegúrate de usar el correo electrónico completo y correcto
            pass: 'kgbs nbwd yqrv gevr' // Asegúrate de usar la contraseña de aplicación correcta
        }
    });

    const correoOpciones = {
        from: 'xanderrap020713@gmail.com', // Asegúrate de que coincida con el correo electrónico usado en el campo `user`
        to: email, // Correo del destinatario
        subject: 'CODIGO DE VERIFICACION', // Asunto del correo
        text: `Tu código de verificación es ${codigo}.` // Cuerpo del correo
    };

    try {
        await transporter.sendMail(correoOpciones);
    } catch (error) {
        throw new Error("Error al enviar el código de verificación");
    }
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

module.exports = {crearUsuario, leerUsuarioLogin, enviarCodigoVerificacion, verificarCodigo}
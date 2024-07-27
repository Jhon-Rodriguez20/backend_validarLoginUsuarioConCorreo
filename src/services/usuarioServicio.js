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

    const email = await usuarioRepositorio.buscarCorreo(usuario.email);
    if (email) throw new Error("El correo ya fue registrado.");

    usuario.idUsuario = uuidv4();
    usuario.passwordEncp = bcrypt.hashSync(usuario.password, 10);
    usuario.verificado = false;
    usuario.intentosEnvio = 0;

    await usuarioRepositorio.crear(new UsuarioEntity(usuario));
    await enviarCodigoVerificacion(usuario.idUsuario, usuario.email);
    
    return await usuarioRepositorio.leerUsuario(usuario.idUsuario);
}

const leerUsuarioLogin = async (email) => {
    const usuario = await usuarioRepositorio.leerUsuarioLogin(email);
    
    if (!usuario || !usuario.verificado) {
        throw new Error("Usuario no verificado o no encontrado.");
    }
    return usuario;
}

const enviarCodigoVerificacion = async (idUsuario, email) => {
    const usuario = await usuarioRepositorio.leerUsuario(idUsuario);
    
    const ahora = new Date();
    if (usuario.bloqueadoHasta && ahora < new Date(usuario.bloqueadoHasta)) {
        throw new Error("Has alcanzado el límite de intentos. Intenta nuevamente más tarde.");
    }

    if (usuario.intentosEnvio >= 4) {
        const bloqueadoHasta = new Date(ahora.getTime() + 30 * 60 * 1000); // 30 minutos
        await usuarioRepositorio.actualizarIntentosEnvio(idUsuario, usuario.intentosEnvio, bloqueadoHasta);
        throw new Error("Has alcanzado el límite de intentos. Intenta nuevamente en 30 minutos.");
    }

    const codigo = crypto.randomInt(100000, 999999).toString();
    const expiracion = Date.now() + 10 * 60 * 1000; // 10 minutos

    const codigoVerificacion = new UsuarioCodigoVerificacionEntity({ idUsuario, codigo, expiracion });
    await usuarioRepositorio.crearCodigo(codigoVerificacion);

    usuario.intentosEnvio++;
    await usuarioRepositorio.actualizarIntentosEnvio(idUsuario, usuario.intentosEnvio);

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
    const codigoVerificacion = await usuarioRepositorio.obtenerCodigo(idUsuario);

    if (!codigoVerificacion || codigoVerificacion.codigo !== codigo || Date.now() > codigoVerificacion.expiracion) {
        if (Date.now() > codigoVerificacion.expiracion) {
            await usuarioRepositorio.eliminarUsuario(idUsuario);
        }
        throw new Error("Código inválido o ha expirado");
    }
    await usuarioRepositorio.eliminarCodigo(idUsuario);

    await usuarioRepositorio.verificarUsuario(idUsuario, true);
    return true;
}

module.exports = {crearUsuario, leerUsuarioLogin, enviarCodigoVerificacion, verificarCodigo}
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const usuarioRepositorio = require('../db/repositorios/usuarioRepositorio');
const { UsuarioCodigoVerificacionEntity } = require('../models/UsuarioModelo');

const enviarCodigoVerificacion = async (idUsuario, email, intentosEnvio) => {
    const usuario = await usuarioRepositorio.leerUsuario(idUsuario);
    const ahora = new Date();
    
    if (usuario.bloqueadoHasta && ahora < new Date(usuario.bloqueadoHasta)) {
        throw new Error("Has alcanzado el límite de intentos. Intenta nuevamente más tarde.");
    }

    if (usuario.bloqueadoHasta && ahora >= new Date(usuario.bloqueadoHasta)) {
        intentosEnvio = 1;

    } else if (intentosEnvio > 3) {
        const bloqueadoHasta = new Date(ahora.getTime() + 30 * 60 * 1000); // 30 minutos
        await usuarioRepositorio.actualizarIntentosEnvio(idUsuario, intentosEnvio, bloqueadoHasta);
        throw new Error("Has alcanzado el límite de intentos. Intenta nuevamente en 30 minutos.");
    }

    const codigo = crypto.randomInt(100000, 999999).toString();
    const expiracion = Date.now() + 10 * 60 * 1000; // 10 minutos
    const codigoVerificacion = new UsuarioCodigoVerificacionEntity({ idUsuario, codigo, expiracion });
    await usuarioRepositorio.eliminarCodigosPrevios(idUsuario);
    await usuarioRepositorio.crearCodigo(codigoVerificacion);
    await usuarioRepositorio.actualizarIntentosEnvio(idUsuario, intentosEnvio);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'xanderrap020713@gmail.com',
            pass: 'kgbs nbwd yqrv gevr'
        }
    });

    const correoOpciones = {
        from: 'xanderrap020713@gmail.com',
        to: email,
        subject: 'CODIGO DE VERIFICACION',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <nav style="padding: 10px;">
                    <img src="https://c0.klipartz.com/pngpicture/517/481/gratis-png-tecnologia-informatica-iconos-informacion-circulo-tecnologia.png" alt="Logo" style="height: 100px;">
                </nav>
                <div style="margin-top: 20px;">
                    <p>Tu código de verificación es:</p>
                    <span style="font-size: 35px;"><strong>${codigo}</strong></span>
                </div>
                <footer style="margin-top: 35px; font-size: 12px; color: #888;">
                    <p>Este mensaje ha sido generado automáticamente, por favor no responda a este correo.</p>
                </footer>
            </div>
        `
    };

    try {
        await transporter.sendMail(correoOpciones);
    } catch (error) {
        throw new Error("Error al enviar el código de verificación");
    }
}

module.exports = enviarCodigoVerificacion;
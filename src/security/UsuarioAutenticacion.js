const localStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const usuarioServicio = require('../services/usuarioServicio');
const jwt = require('jsonwebtoken');
const variables = require('../utils/variables');
const constantesSeguridad = require('./constantesSeguridad');

const crearToken = (usuario) => {
    const horaActual = Math.floor(Date.now() / 1000);
    const horaLocal = horaActual - (5 * 60 * 60);
    const exp = horaLocal + (constantesSeguridad.FECHA_EXPIRACION / 1000);

    const payload = {
        sub: usuario.idUsuario,
        name: usuario.nombre,
        iat: horaLocal,
        exp: exp
    }
    return jwt.sign(payload, variables.TOKEN_SECRETO);
}

const localEstrategia = new localStrategy({ usernameField: 'email', passwordField: 'password' },
    
    async (email, password, callback) => {

        try {
            const usuario = await usuarioServicio.leerUsuarioLogin(email);
            const validarPassword = await bcrypt.compare(password, usuario.passwordEncp);

            if(!validarPassword) {
                callback(null, { error: "Contraseña incorrecta" })
            } else {
                const token = crearToken(usuario);
                callback(null, usuario, token);
            }
        } catch (err) {
            callback(null, { error: "No se encontró el usuario" })
        }
    }
)

module.exports = {localEstrategia}
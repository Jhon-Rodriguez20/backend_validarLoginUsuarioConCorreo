const passport = require('passport');
const UsuarioAutenticacion = require('./UsuarioAutenticacion');
const usuarioRutas = require('../routes/usuarioRutas');
const TokenAutorizacion = require('./TokenAutorizacion');
const cors = require('cors');

const whiteList = ["http://localhost:5173"];

const opcionesCors = {
    "origin": (origen, callback)=> {
        if(whiteList.indexOf(origen) != -1 || !origen) {
            callback(null, true)
        } else {
            callback(new Error("No permitido por CORS"))
        }
    },
    "allowedHeaders": "*",
    "methods": "*"
}

const configuracionSeguridad = (app) => {
    app.use(cors(opcionesCors));
    app.use("/", usuarioRutas);
    passport.use(UsuarioAutenticacion.localEstrategia);
    passport.use(TokenAutorizacion.jwtEstrategia);
}

module.exports = {configuracionSeguridad}
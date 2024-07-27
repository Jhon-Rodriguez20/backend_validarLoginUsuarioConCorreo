const { ExtractJwt, Strategy } = require('passport-jwt');
const variables = require('../utils/variables');

const opciones = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: variables.TOKEN_SECRETO
}

const jwtEstrategia = new Strategy(opciones, (payload, callback) => {
    
    if(payload.sub != null) {
        callback(null, payload)
    } else {
        callback(null, { error: "Token de autorizacion invalido" })
    }
})

module.exports = {jwtEstrategia}
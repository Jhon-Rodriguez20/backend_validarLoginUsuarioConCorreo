const constantesSeguridad = require('../security/constantesSeguridad');

const signin = (req, res, mensaje, estado=200) => {
    res.setHeader("Access-Control-Expose-Headers", "Authorization, IdUsuario, Nombre");
    res.setHeader("IdUsuario", req.user.idUsuario);
    res.setHeader("Nombre", req.user.nombre);
    res.setHeader(constantesSeguridad.HEADER_STRING, constantesSeguridad.TOKEN_PREFIJO + req.authInfo);
    res.status(estado).send("");
}

module.exports = {signin}
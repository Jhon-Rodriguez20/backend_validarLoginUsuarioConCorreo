class UsuarioCrearReqModel {
    constructor(usuario) {
        this.nombre = usuario.nombre;
        this.email = usuario.email;
        this.password = usuario.password;
    }
}

class UsuarioDatosResModel {
    constructor(usuario) {
        this.idUsuario = usuario.idUsuario;
        this.nombre = usuario.nombre;
        this.email = usuario.email;
    }
}

class UsuarioCodigoVerificacionEntity {
    constructor({ idUsuario, codigo, expiracion }) {
        this.idUsuario = idUsuario;
        this.codigo = codigo;
        this.expiracion = expiracion;
    }
}

class UsuarioEntity {
    constructor(usuario) {
        this.idUsuario = usuario.idUsuario;
        this.nombre = usuario.nombre;
        this.email = usuario.email;
        this.passwordEncp = usuario.passwordEncp;
    }
}

module.exports = {UsuarioCrearReqModel, UsuarioDatosResModel, UsuarioCodigoVerificacionEntity, UsuarioEntity}
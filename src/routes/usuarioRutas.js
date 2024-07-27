const usuarioControlador = require('../controllers/usuarioControlador');
const { Router } = require('express');
const passport = require('passport');
const router = Router();

router.post("/crearUsuario",
    usuarioControlador.postUsuario);

router.post("/login",
    passport.authenticate("local", { session: false }),
    usuarioControlador.postSignin);

router.post("/verificarCodigo",
    usuarioControlador.postVerificarCodigo);

module.exports = router;
DROP DATABASE IF EXISTS validarLoginUsuario;
CREATE DATABASE validarLoginUsuario;

USE validarLoginUsuario;

CREATE TABLE `usuario` (
    `idUsuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
    `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
    `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
    `verificado` BOOLEAN DEFAULT FALSE NOT NULL,
    `intentosEnvio` INT DEFAULT 0 NOT NULL,
    `bloqueadoHasta` DATETIME DEFAULT NULL,
    `passwordEncp` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
    PRIMARY KEY (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuarioCodigoVerificacion (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `idUsuario` VARCHAR(50) NOT NULL,
    `codigo` VARCHAR(6) NOT NULL,
    `expiracion` BIGINT NOT NULL,
    `intentosEnvio` INT DEFAULT 0,
    FOREIGN KEY (`idUsuario`) REFERENCES usuario(`idUsuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
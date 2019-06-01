module.exports = {
    user: {
        invalidUsername: {
            description: "invalidUsername",
            message: {
                pt: "Nome de utilizador não encontrado."
            },
            status: 200,
            success: false
        },
        invalidPassword: {
            description: "invalidPassword",
            message: {
                pt: "Palavra-passe inválida."
            },
            status: 200,
            success: false
        },
        loginSuccess(jwt, user) {
            return {
                description: "valid",
                message: {
                    pt: "Sessão iniciada."
                },
                content: { jwt, user },
                status: 200,
                success: true
            }
        }
    },
    token: {
        missing: {
            description: "missingToken",
            message: {
                pt: "Token necessário."
            },
            status: 401,
            success: false
        },
        malformated: {
            description: "malformatedToken",
            message: {
                pt: "Token desformatado."
            },
            status: 401,
            success: false
        },
        invalid: {
            description: "invalidToken",
            message: {
                pt: "Token inválido."
            },
            status: 401,
            success: false
        }
    }
}
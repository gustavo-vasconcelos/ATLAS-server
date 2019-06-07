module.exports = {
    db: {
      error: {
         description: "dbError",
        message: {
            pt: "Algo correu mal."
        },
        status: 503,
        success: false
      }  
    },
    user: {
        getUsers(users) {
            return {
                description: "getUsers",
                content: {
                    users
                },
                status: 200,
                success: true
            }
        },
        invalidUsername: {
            description: "invalidUsername",
            message: {
                pt: "Nome de utilizador não encontrado."
            },
            status: 404,
            success: false
        },
        invalidPassword: {
            description: "invalidPassword",
            message: {
                pt: "Palavra-passe inválida."
            },
            status: 401,
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
    event: {
        notFound: {
            description: "eventNotFound",
            message: {
                en: "Event not found.",
                pt: "Evento não encontrado."
            },
            status: 404,
            success: false
        },
        discussion: {
            notFound: {
                description: "eventDiscussionNotFound",
                message: {
                    en: "Discussion not found.",
                    pt: "Discussão não encontrada."
                },
                status: 404,
                success: false
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
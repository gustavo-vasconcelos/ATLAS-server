module.exports = {
    db: {
      error: {
         name: "dbError",
        message: {
            pt: "Algo correu mal."
        },
        status: 503,
        success: false
      }  
    },
    user: {
        notFound: {
            name: "usersNotFound",
            content: {
                users: []
            },
            status: 404,
            success: false
        },
        getUsers(users, name) {
            return {
                name,
                content: {
                    users
                },
                status: 200,
                success: true
            }
        },
        invalidUsername: {
            name: "invalidUsername",
            message: {
                pt: "Nome de utilizador não encontrado."
            },
            status: 404,
            success: false
        },
        invalidPassword: {
            name: "invalidPassword",
            message: {
                pt: "Palavra-passe inválida."
            },
            status: 401,
            success: false
        },
        loginSuccess(jwt, user) {
            return {
                name: "valid",
                message: {
                    pt: "Sessão iniciada."
                },
                content: { jwt, user },
                status: 200,
                success: true
            }
        },
        signUpError(errors) {
            return {
                name: "signUpError",
                message: {
                    pt: "Preencha todos os campos corretamente."
                },
                content: { error: errors },
                status: 400,
                success: false
            }
        },
        signUpSuccess: {
            name: "signUpSuccess",
            message: {
                pt: "Conta criada com sucesso."
            },
            status: 200,
            success: true
        },
        insufficientPermissions: {
            name: "insufficientPermissions",
            message: {
                pt: "Sem permissões."
            },
            status: 403,
            success: false
        }
    },
    event: {
        notFound: {
            name: "eventNotFound",
            message: {
                en: "Event not found.",
                pt: "Evento não encontrado."
            },
            status: 404,
            success: false
        },
        discussion: {
            notFound: {
                name: "eventDiscussionNotFound",
                message: {
                    en: "Discussion not found.",
                    pt: "Discussão não encontrada."
                },
                status: 404,
                success: false
            }
        }
    },
    tag: {
        notFound: {
            name: "tagsNotFound",
            message: {
                en: "Tags not found.",
                pt: "Nenhuma tag foi encontrada."
            },
            status: 404,
            success: false
        }
    },
    course: {
        notFound: {
            name: "coursesNotFound",
            message: {
                en: "Courses not found.",
                pt: "Nenhum curso foi encontrado."
            },
            status: 404,
            success: false
        }
    },
    success(name, content) {
        return {
            name,
            content,
            status: 200,
            success: true
        }
    },
    token: {
        missing: {
            name: "missingToken",
            message: {
                pt: "Token necessário."
            },
            status: 401,
            success: false
        },
        malformated: {
            name: "malformatedToken",
            message: {
                pt: "Token desformatado."
            },
            status: 401,
            success: false
        },
        invalid: {
            name: "invalidToken",
            message: {
                pt: "Token inválido."
            },
            status: 401,
            success: false
        }
    }
}
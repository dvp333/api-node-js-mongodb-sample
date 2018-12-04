import * as restify from 'restify'

export const handleError = (req: restify.Request, resp: restify.Response, err, done) => {
    err.toJSON = () => {
        return {
            message: err.message
        }
    }
    switch (err.name) {
        case 'MongoError':
            if (err.code === 11000) { // código do erro de chave duplicada do Mongo
                err.statusCode = 400 // O professor assumiu este erro como do usuário
            }
            break
        case 'ValidationError':
            err.statusCode = 400
            break
    }
    done()
}
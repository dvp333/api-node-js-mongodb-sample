import {Router} from '../common/router'
import * as restify from 'restify'
import {User} from './users.model'
import {NotFoundError} from 'restify-errors'

class UsersRouter extends Router {

    constructor () {
        super()
        this.on('beforeRender', document => {
            document.password = undefined
        })
    }

    applyRoutes(application: restify.Server) {
        application.get('/users', (req, resp, next) => {
            User.find()
                .then(this.render(resp,next))
                .catch(next)
        })

        application.get('/users/:id', (req, resp, next) => {
            User.findById(req.params.id)
                .then(this.render(resp,next))
                .catch(next)
        })

        application.post('/users', (req, resp, next) => {
            let user = new User(req.body) //os atributos com os mesmo nomes são preenchidos automaticamente
            user.save()
                .then( user => {
                    user.password = undefined
                    resp.status(201)
                    resp.json(user)
                    return next()
                })
                .catch(next)
        })

        
        application.put('/users/:id', (req, resp, next) => {
            const options = {overwrite: true}
            User.update({_id:req.params.id}, req.body, options).exec()
                .then(result => {
                    if (result.n){
                        return User.findById(req.params.id).exec()
                    } else {
                        throw new NotFoundError('Documento não encontrado')
                    }
                })
                .then(user => {
                    resp.json(user)
                    return next()
                })
                .catch(next)
        })
        

        application.patch('/users/:id', (req, resp, next) => {
            const options = {new:true} // faz com que o parâmetro do 'then' retorne o usuario já atualizado
            User.findByIdAndUpdate(req.params.id, req.body, options).then(user => {
                if (user)
                    resp.json(user)
                else
                throw new NotFoundError('Documento não encontrado')
                return next()
            }).catch(next)
        })

        application.del('/users/:id', (req, resp, next) => {
            User.remove({_id:req.params.id}).exec().then((cmdResult:any) => {
                if (cmdResult.result.n)
                    resp.send(204)
                else
                    throw new NotFoundError('Documento não encontrado')
                return next()
            }).catch(next)
        })
        

    }
}

export const usersRouter = new UsersRouter()
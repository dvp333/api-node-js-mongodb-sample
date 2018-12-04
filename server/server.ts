import * as restify from 'restify'
import {environment} from '../common/environment'
import {Router} from '../common/router'
import * as mongoose from 'mongoose'
import {mergePatchBodyParser} from './merge-patch.parser'
import {handleError} from './error.handler'

export class Server {
    
    application: restify.Server

    initializeDB () : mongoose.MongooseThenable {
        (<any>mongoose).Promise = global.Promise
        return mongoose.connect(environment.server.db.url, {
            useMongoClient: true
        })
    }

    initRoutes(routers: Router[]): Promise<any> {
        return new Promise( (resolve, reject) => {
            try {

                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                })
                
                // Este plugin serve para preencher a propriedade req.query com os queryParameters em formato JSON 
                this.application.use(restify.plugins.queryParser())
                this.application.use(restify.plugins.bodyParser())
                this.application.use(mergePatchBodyParser)
                
                //routes
                routers.forEach( router => {
                    router.applyRoutes(this.application)
                })

                this.application.listen(environment.server.port, () => {
                    //console.log('Server is running on port 3000')
                    resolve(this.application)
                })

                this.application.on('restifyError', handleError)
            } catch (error) {
                reject(error)
            }
        })
    }

    bootstrap(routers: Router[] = []): Promise<Server> {
        return this.initializeDB().then( () => 
               this.initRoutes(routers).then(() => this))
    }

}
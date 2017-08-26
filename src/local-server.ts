import { getServices, isMultiUse } from './helpers/args';
import * as http from 'http';
import * as express from 'express';
import * as chalk from 'chalk';
import { json as jsonParser } from 'body-parser';
import { Args } from './models/args';

export class LocalServer {

    private server: http.Server;
    private app: express.Application;
    private router: express.Router;
    private sockets: { [id: number]: any } = {};
    private nextSocketId = 0;

    constructor() {
        this.app = express()
        this.app.use(jsonParser())
        this.router = express.Router();
    }

    public run = (args: Args) => {
        if(args.allowCrossOrigin) {
            console.log(chalk.cyan('Enabling CORS'));
            this.app.use(this.allowCrossDomain);
        }

        let handlers = getServices(args);

        let basePath = args.basePath || '/api';
        this.setupRouteHandlers(basePath, handlers);
        
        this.app.use(basePath, this.router);
        process.on('SIGINT', this.shutdownServer);
        // Fork server process
        this.server = this.app.listen(args.port || 8181, this.serverStarted);
        this.server.on('connection', this.registerConnection);
    }

    /** Helpers: START */

    setupRouteHandlers(basePath: string, handlers: Array<any>): void {
        for(let handler in handlers) {
            let serviceName = handlers[handler].substr(0, handlers[handler].lastIndexOf('.'));
            console.log(chalk.magenta(`[Adding route ${basePath}/${serviceName}]`));
            this.router.post(`/${serviceName}`, (req, res) => {
                res.statusCode = 200;
                res.json({});
                return res.end();
            })
        }
    }
    // Simple CORS middleware
    private allowCrossDomain(req: express.Request, res: express.Response, next) {
        res.header('Access-Control-Allow-Origin', req.hostname);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        
        if ('OPTIONS' === req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    }

    private serverStarted() {
        console.log(chalk.cyan('Running...'));
    }

    private registerConnection = (socket) => {
        this.sockets[this.nextSocketId] = socket;
        socket.on('close', () => {
            delete this.sockets[this.nextSocketId];
        })
    }

    private closeAllConnections = () => {
        for (let socketId in this.sockets) {
            this.sockets[socketId].destroy();
        }
    }

    // Use instance functions to allow access to this.server
    private shutdownServer = () => {
        console.log(chalk.cyan('\nStopping server...'));
        this.server.on("close", () => {
            console.log(chalk.cyan('Server stopped.'));
        });

        try
        {
            this.closeAllConnections();
            this.server.close();
        } catch(error) {
            console.log(chalk.red(error));
        }
    }

    /** Helpers: END */
}
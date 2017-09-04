import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as Bluebird from 'bluebird';
import { Parser } from 'expr-eval';

import { LambdaHandler, LambdaHandlerCallback } from './models/lambda-handler';

export class HandlerDeserializer {

    buildHandlerFromFilesystem(filename: string): Promise<LambdaHandler> {
        return new Promise((resolve, reject) => {
            let handler = require(filename);
            if(handler.handler === undefined) reject('The object does not export a handler');
            if(handler.handler.call === undefined) reject('The handler is not a function');
            if(handler.handler.length !== 3) reject('The handler function does not take the correct number of args')
            resolve(handler);
        })
    }
}
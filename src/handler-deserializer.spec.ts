import * as fs from 'fs';
import * as chai from 'chai';
import { expect, should } from 'chai';
import * as Rx from 'rxjs';
import * as mock from 'mock-fs';
import { binding, given, when, then } from 'cucumber-tsflow';
import { suite, test, slow, timeout,  } from 'mocha-typescript';
import { HandlerDeserializer } from './handler-deserializer';
import { LambdaHandler, LambdaHandlerCallback } from './models/lambda-handler';
import * as chaiAsPromised from 'chai-as-promised';
import * as mockery from 'mockery';

@suite
class GivenAFilename {
    before() {
        chai.use(chaiAsPromised);
        mockery.warnOnReplace(false);
        mockery.enable();
    }
    @test
    WhenTheFileDefinesAnInvalidHandlerFunction_ThenDeserializerThrowsAnError() {
        let invalidHandler = {
            handler: (event, context) => {
                console.log('test');
            }
        }
        mockery.registerMock('invalid-handler', invalidHandler);
        let deserializer = new HandlerDeserializer();
        
        return expect(deserializer.buildHandlerFromFilesystem('invalid-handler'))
            .to.be.eventually.rejectedWith('The handler function does not take the correct number of args');
    }

    @test
    WhenTheFileDefinesAValidHandlerFunction_ThenDeserializerReturnsTheHandler() {
        let validHandler = {
            handler: (event, context, callback) => {
                console.log('test');
            }
        }
        mockery.registerMock('valid-handler', validHandler);
        let deserializer = new HandlerDeserializer();

        return expect(deserializer.buildHandlerFromFilesystem('valid-handler'))
            .to.eventually.have.property('handler');
    }

    @test
    WhenTheFileDefinesAValidFunctionAndTheFunctionIsReturned_ThenTheFunctionExecutesTheCallback() {
        let validHandler = {
            handler: (event, context, callback) => {
                callback(null, 'Done');
            }
        }
        
        mockery.registerMock('valid-handler', validHandler);
        let deserializer = new HandlerDeserializer();
        return expect(deserializer.buildHandlerFromFilesystem('valid-handler').then((handler: any) => {

            return new Promise(resolve => {
                    handler.handler(null, null, (err, result) => {
                        resolve(result);
                    })
                })
        })).to.eventually.equal('Done');

    }
}
export interface LambdaHandler {
    (event: any, context: any, callback: LambdaHandlerCallback): void;
}

export interface LambdaHandlerCallback {
    (error: Error, response: any): void;
}
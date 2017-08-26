import * as minimist from 'minimist';

export interface Args extends minimist.ParsedArgs {
    runLocal: boolean;
    port?: number;
    allowCrossOrigin?: boolean;
    basePath?: string;
    handler: string | string[];
}
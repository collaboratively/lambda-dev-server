import * as minimist from 'minimist';
import * as chalk from 'chalk';
import { Args } from '../models/args';

export function isArgs(argv: minimist.ParsedArgs): argv is Args {
    let castedArgs = <Args>argv;
    return castedArgs.runLocal !== undefined &&
        castedArgs.handler !== undefined;
}

export function isMultiUse(item: string | string[]): item is string[] {
    return item instanceof Array;
}

export function getServices(args: Args) {
    if(isMultiUse(args.handler)) {
        return args.handler;
    } else {
        return [ args.handler ];
    }
}

export function printArgs(argv: minimist.ParsedArgs, chalkColor: chalk.ChalkChain) {
    console.log(chalkColor('Input args:\n=========='));
    let count = 1;
    Object.keys(argv).forEach(k => {
        console.log(chalkColor(`[${count}] ${k}: ${argv[k]}`));
        count++;
    })
    console.log(chalkColor('=========='));
}
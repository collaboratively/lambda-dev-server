import * as minimist from 'minimist';
import * as chalk from 'chalk';
import { LocalServer } from './local-server';
import { isArgs, printArgs } from './helpers/args';
import { Args } from './models/args';

let argv = minimist(process.argv.slice(2));
if(process.env.NODE_ENV != 'production') printArgs(argv, chalk.red);

if(isArgs(argv)) {
    let server = new LocalServer();
    server.run(argv);
} else {
    console.log(chalk.red('Unexpected args. Exiting.'))
}

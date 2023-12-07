import { white, green, blue, yellow } from 'colors/safe';


export interface ILogger {
    logStr: string
    execTime: number | undefined
    opts: any
}

export function dbLogger(logStr: string, execTime: number | undefined, opts?: any) {
    if (!opts) {
        opts = execTime;
        execTime = undefined;
    }

    let col = white
    switch (opts.type) {
        case 'SELECT':
            col = blue;
            break;
        case 'UPDATE':
            col = yellow;
            break;
        case 'INSERT':
            col = green;
            break;
        default:
            col = white;
            break;
    }
    const junk1 = logStr.indexOf('CREATE TABLE IF NOT EXISTS')
    const junk2 = logStr.indexOf('SELECT i.relname AS name, ix.indisprimary')
    if ((junk1 === -1 && junk2 === -1)) {
        console.log(col(logStr));
    }
}
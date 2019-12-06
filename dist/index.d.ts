/// <reference types="node" />
import cl from 'cluster';
import { EventEmitter } from 'events';
import repl from 'repl';
export * from './worker';
interface ParalioConfiguration<Input, Context = {
    [key: string]: any;
}> {
    max?: number;
    input?: Input[] | string;
    workerPath: string;
    context?: Context;
    repl?: boolean;
    onInputLoaded?: (string: any) => Input[];
}
export declare class Paralio<Input = any, Output = any, Context = {
    [key: string]: any;
}> extends EventEmitter {
    output: Output[];
    workers: number;
    input: Input[];
    _input: Input[];
    max: number;
    workerPath: string;
    repl: repl.REPLServer | null;
    context: Context | {
        [key: string]: any;
    };
    constructor(config: ParalioConfiguration<Input, Context>);
    on(event: 'start', listener: (app: Paralio) => any): any;
    on(event: 'end', listener: (app: Paralio) => any): any;
    on(event: 'consume', listener: (items: [Input[], Input | undefined]) => any): any;
    on(event: 'data', listener: ([data, app]: [Output, Paralio]) => any): any;
    emit(event: 'start', data: Paralio): any;
    emit(event: 'end', data: Paralio): any;
    emit(event: 'consume', data: [Input[], Input | undefined]): any;
    emit(event: 'data', data: [Output, Paralio]): any;
    consume(): Input | null;
    loadInput({ input, onInputLoaded, }: ParalioConfiguration<Input, Context>): Input[];
    end(): boolean;
    run(): void;
    displayLogo(clear?: boolean): void;
    save(path?: string): Promise<string>;
    log(...args: any[]): void;
    initREPL(): repl.REPLServer;
    initWorkers(): void;
    package(): [Input | null, Context];
    initOnMessage(w: cl.Worker): (data: Output) => void;
}

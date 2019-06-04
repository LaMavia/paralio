/// <reference types="node" />
import { EventEmitter } from 'events';
import cl from 'cluster';
import repl from 'repl';
export * from './worker';
interface ParalioConfiguration<Input> {
    max: number;
    workerPath: string;
    input: Input[];
}
export declare class Paralio<Input = any, Output = any> extends EventEmitter {
    output: Output[];
    workers: number;
    input: Input[];
    _input: Input[];
    max: number;
    workerPath: string;
    repl: repl.REPLServer;
    constructor(config: ParalioConfiguration<Input>);
    on(event: 'start', listener: (app: Paralio) => any): any;
    on(event: 'end', listener: (app: Paralio) => any): any;
    on(event: 'consume', listener: (items: [Input[], Input | undefined]) => any): any;
    emit(event: 'start', data: Paralio): any;
    emit(event: 'end', data: Paralio): any;
    emit(event: 'consume', data: [Input[], Input | undefined]): any;
    consume(): Input | null;
    end(): boolean;
    run(): void;
    displayLogo(clear?: boolean): void;
    save(path?: string): Promise<string>;
    log(...args: any[]): void;
    initREPL(): repl.REPLServer;
    initWorkers(): void;
    initOnMessage(w: cl.Worker): (data: Output) => void;
}

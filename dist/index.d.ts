/// <reference types="node" />
import { EventEmitter } from 'events';
import cl from 'cluster';
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
    constructor(config: ParalioConfiguration<Input>);
    on(event: 'end', listener: (app: Paralio) => any): any;
    on(event: 'consume', listener: (items: [Input[], Input | undefined]) => any): any;
    emit(event: 'end', data: Paralio): any;
    emit(event: 'consume', data: [Input[], Input | undefined]): any;
    consume(): Input | null;
    end(): boolean;
    initREPL(): void;
    initWorkers(): void;
    initOnMessage(w: cl.Worker): (data: Output) => void;
}

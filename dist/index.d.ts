/// <reference types="node" />
import { EventEmitter } from 'events';
import cl from 'cluster';
export * from './worker';
export declare class Paralio<Input = any, Out = any> extends EventEmitter {
    max: number;
    workerPath: string;
    input: Input[];
    output: Out[];
    workers: number;
    _input: Input[];
    constructor(max: number, workerPath: string, input: Input[]);
    on(event: 'end', listener: (app: Paralio) => any): any;
    on(event: 'consume', listener: (items: [Input[], Input | undefined]) => any): any;
    emit(event: 'end', data: Paralio): any;
    emit(event: 'consume', data: [Input[], Input | undefined]): any;
    consume(): Input | null;
    end(): boolean;
    initREPL(): void;
    initWorkers(): void;
    initOnMessage(w: cl.Worker): (data: Out) => void;
}

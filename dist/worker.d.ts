/// <reference types="./src/types" />
export declare abstract class Worker<MessageType = string, ContextType = BasicContext> {
    context: BasicContext & ContextType;
    constructor();
    onMessage(msg: MessageType): Promise<any> | void;
    onMount(): Promise<any> | void;
    onDismount(): Promise<any> | void;
}

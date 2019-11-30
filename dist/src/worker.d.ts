export declare abstract class Worker<MessageType = string, ContextType = {
    [key: string]: any;
}> {
    context: {
        [key: string]: any;
    } | ContextType;
    constructor();
    onMessage(msg: MessageType): Promise<any> | void;
    onMount(): Promise<any> | void;
    onDismount(): Promise<any> | void;
}

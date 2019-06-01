export declare abstract class Worker<MessageType = string> {
    constructor();
    onMessage(msg: MessageType): Promise<any> | void;
}

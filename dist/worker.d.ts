export declare abstract class Worker<MessageType> {
    constructor();
    onMessage(msg: MessageType): Promise<any> | void;
}
/**
 * @description A Helper command for starking worker. Used instead of writing:
 ```javascript
 const worker = (new class extends Worker {...})()
 ```
 * @param {typeof Worker} workerClass
 */
export declare const s: <T extends new (...args: any[]) => Worker<any>>(workerClass: T) => Worker<any>;

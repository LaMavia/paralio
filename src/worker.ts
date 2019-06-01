export abstract class Worker<MessageType> {
  constructor() {
    process.on('message', async (msg: MessageType) => {
      const p = this.onMessage(msg)
      let res =
        !p ||
        (await (p as Promise<any>).catch((err: Error) => {
          console.log(
            `[W:${process.pid}]> ERROR: "${err.message}"\nSTACK: ${
              err.stack
            }; Bailing out!`
          )
          process.disconnect()
        }))
      process.send && process.send(res)
    })

    process.on('newListener', l => {
      console.log(`[Worker]> New worker #${process.pid} connected!`)
    })
  }

  onMessage(msg: MessageType): Promise<any> | void {
    return void 0
  }
}

/**
 * @description A Helper command for starking worker. Used instead of writing: 
 ```javascript
 const worker = (new class extends Worker {...})()
 ```
 * @param {typeof Worker} workerClass 
 */
export const s = <T extends new (...args: any[]) => Worker<any>>(
  workerClass: T
) => {
  return new workerClass()
}

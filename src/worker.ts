export abstract class Worker<MessageType = string> {
  constructor() {
    process.on('message', async (msg: MessageType) => {
      if(!msg) return;
      const p = this.onMessage(msg)
      let res =
        !p ||
        (await (p as Promise<any>).catch((err: Error) => {
          console.log(
            `[W:${process.pid}]> ERROR: "${err.message}"\nSTACK: ${
              err.stack
            };\n MESSAGE: ${msg};\n Bailing out!`
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
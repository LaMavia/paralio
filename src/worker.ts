export abstract class Worker<
  MessageType = string,
  ContextType = { [key: string]: any }
> {
  context: { [key: string]: any } | ContextType = {}

  constructor() {
    process.on('newListener', l => {
      // process.stdout.write(`[Worker]> New worker #${process.pid} connected!`)
       console.log(`[Worker]> New worker #${process.pid} connected!`)
    })

    process.on('message', async ([msg, ctx]: [MessageType, ContextType]) => {
      if (!msg) return
      this.context = Object.assign(this.context, ctx)
      const p = this.onMessage(msg)
      let res =
        p instanceof Promise
          ? await (p as Promise<any>).catch((err: Error) => {
              console.log(
                `[W:${process.pid}]> ERROR: "${err.message}"\nSTACK: ${
                  err.stack
                };\n MESSAGE: ${msg};\n Bailing out!`
              )
              process.disconnect()
            })
          : p
      process.send && process.send(res)
    })
  }

  onMessage(msg: MessageType): Promise<any> | void {
    return void 0
  }
}

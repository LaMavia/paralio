export abstract class Worker<
  MessageType = string,
  ContextType = { [key: string]: any }
> {
  context: { [key: string]: any } | ContextType = {}

  constructor() {
    process.on('newListener', async l => {
      await this.onMount()
      console.log(`[Worker]> New worker #${process.pid} connected!`)

      // -------- Fake dispaying the prompt -------- //
      process.stdout.write('> ')
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

    process.on('beforeExit', async () => {
      try {
        await this.onDismount()
      } catch (e) {
        console.error(e)
      }
    })
  }

  onMessage(msg: MessageType): Promise<any> | void {
    return void 0
  }

  onMount(): Promise<any> | void {
    return void 0
  }

  onDismount(): Promise<any> | void {
    return void 0
  }
}

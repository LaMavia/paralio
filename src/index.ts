import { EventEmitter } from 'events'
import cl from 'cluster'
import repl from 'repl'

export * from './worker'
export class Paralio<Input = any, Out = any> extends EventEmitter {
  output: Out[] = []
  workers: number = 0
  _input: Input[]

  constructor(
    public max: number,
    public workerPath: string,
    public input: Input[]
  ) {
    super()
    this._input = this.input.slice()
    this.initWorkers()
    this.initREPL()
    process.on('beforeExit', () => {
      for (const id in cl.workers) (cl.workers[id] as cl.Worker).kill()
    })
  }

  on(event: 'end', listener: (app: Paralio) => any): any
  on(
    event: 'consume',
    listener: (items: [Input[], Input | undefined]) => any
  ): any
  on(event: string, listener: (...args: any[]) => any): any {
    super.on(event, listener)
  }

  emit(event: 'end', data: Paralio): any
  emit(event: 'consume', data: [Input[], Input | undefined]): any
  emit(event: string, data: any): any {
    super.emit(event, data)
  }

  consume() {
    debugger
    const item = this._input.pop()
    this.emit('consume', [this._input, item])
    return item || null
  }

  end() {
    return this._input.length <= 0
  }

  initREPL() {
    const r = repl.start()
    const self = this
    Object.defineProperty(r.context, 'self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    })
  }

  initWorkers() {
    debugger
    cl.setupMaster({
      exec: this.workerPath,
    })
    for (let i = 0; i < this.max; i++) {
      if (this._input.length <= 0) break
      // const w = cp.fork(this.workerPath)
      const wk = cl.fork()
      this.workers++

      wk.on('message', this.initOnMessage(wk))
      wk.send(this.consume())
    }
  }

  initOnMessage(w: cl.Worker) {
    return (data: Out) => {
      this.output.push(data)
      if (this.end()) {
        w.kill()
        if (--this.workers <= 0) this.emit('end', this)
      } else {
        w.send(this.consume())
      }
    }
  }
}

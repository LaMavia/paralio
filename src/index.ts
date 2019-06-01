import { EventEmitter } from 'events'
import cl from 'cluster'
import repl from 'repl'
import fs from "fs"
import { resolve } from 'path';

export * from './worker'

interface ParalioConfiguration<Input> {
  max: number
  workerPath: string
  input: Input[]
}

export class Paralio<Input = any, Output = any> extends EventEmitter {
  output: Output[] = []
  workers: number = 0
  input: Input[]
  _input: Input[] = []
  max: number
  workerPath: string
  repl: repl.REPLServer

  constructor(config: ParalioConfiguration<Input>) {
    super()
    this.input = config.input
    this.max = config.max
    this.workerPath = config.workerPath
    this.repl = this.initREPL()
    process.on('beforeExit', () => {
      for (const id in cl.workers) (cl.workers[id] as cl.Worker).kill()
    })
    this.run()
  }

  on(event: 'start', listener: (app: Paralio) => any): any
  on(event: 'end', listener: (app: Paralio) => any): any
  on(
    event: 'consume',
    listener: (items: [Input[], Input | undefined]) => any
  ): any
  on(event: string, listener: (...args: any[]) => any): any {
    super.on(event, listener)
  }

  emit(event: 'start', data: Paralio): any
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

  run() {
    this.displayLogo()
    this.output = []
    this._input = this.input.slice()
    this.initWorkers()
  }

  displayLogo(clear: boolean = true) {
    clear && console.clear()
    console.log([
      '095', '095', '095', '095', '095', '095', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '095', '032', '095', '032', '032', '032', '032', '032', '032', '032', '013', '010', '124', '032', '095', '095', '095', '032', '092', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '032', '124', '032', '040', '095', '041', '032', '032', '032', '032', '032', '032', '013', '010', '124', '032', '124', '095', '047', '032', '047', '095', '032', '095', '032', '095', '032', '095', '095', '032', '095', '095', '032', '095', '124', '032', '124', '095', '032', '032', '095', '095', '095', '032', '032', '013', '010', '124', '032', '032', '095', '095', '047', '032', '095', '096', '032', '124', '032', '039', '095', '095', '047', '032', '095', '096', '032', '124', '032', '124', '032', '124', '047', '032', '095', '032', '092', '032', '013', '010', '124', '032', '124', '032', '124', '032', '040', '095', '124', '032', '124', '032', '124', '032', '124', '032', '040', '095', '124', '032', '124', '032', '124', '032', '124', '032', '040', '095', '041', '032', '124', '013', '010', '092', '095', '124', '032', '032', '092', '095', '095', '044', '095', '124', '095', '124', '032', '032', '092', '095', '095', '044', '095', '124', '095', '124', '095', '124', '092', '095', '095', '095', '047',
    ].map(x => String.fromCharCode(+x)).join(''), `\n\n`)
  }

  save(path?: string): Promise<string> {
    return new Promise((res, rej) => {
      const d = new Date()
      const p = resolve(path || process.cwd(), `./output-${d.getDay()}.${d.getMonth()}.${d.getFullYear()}-${d.getHours()}:${d.getMinutes()}.json`)

      fs.writeFile(p, JSON.stringify(this.output, null, 2), {
        encoding: "utf-8"
      }, (err) => {
        if(err) rej(err)
        else res(p)
      })
    })
  }

  log(...args: any[]) {
    console.log(...args)
    this.repl.prompt()
  }

  initREPL() {
    const r = repl.start()
    const self = this

    r.displayPrompt()
    r.defineCommand("rerun", (x) => {
      r.question("Are you sure you wanna rerun the app? [y/n]", a => {
        if(['y', "y", "Yes", "yes", "yep", "sure"].some(x => x === a)) {
          this.run()
          this.log("Rerunning the application...")
        } else {
          this.log("Fine...")
        }
      })
    })

    r.defineCommand('save', path => {
      this.log('Saving the output data...')
      this.save(path)
        .then(p => {
          this.log(`saved to: ${p}`)
        })
        .catch((err: Error) =>
          console.error(
            `Error while saving the data: ${err.message}; ${err.stack}`
          )
        )
    })

    Object.defineProperty(r.context, 'self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    })
    
    return r
  }

  initWorkers() {
    cl.setupMaster({
      exec: this.workerPath,
    })
    for (let i = 0; i < this.max; i++) {
      if (this._input.length <= 0) break
      const wk = cl.fork()
      this.workers++

      wk.on('message', this.initOnMessage(wk))
      wk.send(this.consume())
    }

    this.log("Starting the app...")
    this.emit('start', this)
  }

  initOnMessage(w: cl.Worker) {
    return (data: Output) => {
      this.output.push(data)
      if (this.end()) {
        w.kill()
        if (--this.workers <= 0) {
          this.emit('end', this)
          process.nextTick(() =>
            this.log(`Finished with ${this.output.length} results`)
          )
        }
      } else {
        w.send(this.consume())
      }
    }
  }
}

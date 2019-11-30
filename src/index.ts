import cl from 'cluster'
import { EventEmitter } from 'events'
import fs from 'fs'
import { cpus } from 'os'
import { resolve } from 'path'
import repl from 'repl'
import { logo } from './static_data'

export * from './worker'

interface ParalioConfiguration<Input, Context = { [key: string]: any }> {
  max?: number
  input?: Input[] | string
  workerPath: string
  context?: Context
  onInputLoaded?: (string) => Input[]
}

export class Paralio<
  Input = any,
  Output = any,
  Context = { [key: string]: any }
> extends EventEmitter {
  output: Output[] = []
  workers: number = 0
  input: Input[]
  _input: Input[] = []
  max: number
  workerPath: string
  repl: repl.REPLServer
  context: Context | { [key: string]: any }

  constructor(config: ParalioConfiguration<Input, Context>) {
    super()
    this.input = this.loadInput(config)
    this.max = config.max || cpus().length
    this.context = config.context || {}
    this.workerPath = config.workerPath
    this.repl = this.initREPL()
    process.on('beforeExit', () => {
      console.log('Goodbye mate!')
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
  on(event: 'data', listener: (data: Output) => any): any
  on(event: string, listener: (...args: any[]) => any): any {
    super.on(event, listener)
  }

  emit(event: 'start', data: Paralio): any
  emit(event: 'end', data: Paralio): any
  emit(event: 'consume', data: [Input[], Input | undefined]): any
  emit(event: 'data', data: Output): any
  emit(event: string, data: any): any {
    return super.emit(event, data)
  }

  consume() {
    debugger
    const item = this._input.pop()
    this.emit('consume', [this._input, item])
    return item || null
  }

  loadInput({
    input,
    onInputLoaded,
  }: ParalioConfiguration<Input, Context>): Input[] {
    switch (true) {
      case Array.isArray(input): {
        return input as Input[]
      }
      case typeof input === 'string' && !!input: {
        const data = fs.readFileSync(input as string, { encoding: 'utf-8' })
        return onInputLoaded ? onInputLoaded(data) : []
      }
      default:
        throw new Error(
          `Input is neither array, nor a string; ${JSON.stringify(
            input,
            null,
            2
          )}`
        )
    }
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
    console.log(logo, `\n\n`)
  }

  save(path?: string): Promise<string> {
    return new Promise((res, rej) => {
      const d = new Date()
      const p = resolve(
        path || process.cwd(),
        `./output-${d.getDay()}.${d.getMonth()}.${d.getFullYear()}-${d.getHours()}:${d.getMinutes()}.json`
      )

      fs.writeFile(
        p,
        JSON.stringify(this.output, null, 2),
        {
          encoding: 'utf-8',
        },
        err => {
          if (err) rej(err)
          else res(p)
        }
      )
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
    r.defineCommand('rerun', x => {
      r.question('Are you sure you wanna rerun the app? [y/n]', a => {
        if (['y', 'y', 'Yes', 'yes', 'yep', 'sure'].some(x => x === a)) {
          this.run()
          this.log('Rerunning the application...')
        } else {
          this.log('Fine...')
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

    this.log('Starting the app...')
    this.emit('start', this)
    
    for (let i = 0; i < this.max; i++) {
      if (this._input.length <= 0) break
      const wk = cl.fork()
      this.workers++

      wk.on('message', this.initOnMessage(wk))
      wk.send(this.package())
    }
  }

  package(): [Input | null, Context] {
    return [this.consume(), this.context as Context]
  }

  initOnMessage(w: cl.Worker) {
    return (data: Output) => {
      this.output.push(data)
      this.emit('data', data)
      if (this.end()) {
        w.kill()
        if (--this.workers <= 0) {
          this.emit('end', this)
          process.nextTick(() =>
            this.log(`Finished with ${this.output.length} results`)
          )
        }
      } else {
        w.send(this.package())
      }
    }
  }
}

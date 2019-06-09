import { Paralio } from '../src'
import { resolve } from 'path'

export interface Context {
  name: string
}

async function main() {
  const app = new Paralio({
    max: 4,
    workerPath: resolve(__dirname, './worker'),
    input: resolve(__dirname, "./input.json"),
    context: {
      name: "Bob"
    } as Context,
    onInputLoaded: JSON.parse
  })

  app.on('end', self => {
    self.output = self.output.filter(x => !!x).sort()
  })
}

main()

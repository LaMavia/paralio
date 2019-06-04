<img height="100" width="100%" src="./logo.svg"/>

# <center>Node.js multithreded executer</center>

# Classes

## Paralio

The `Paralio` class is the heart of your application.

```typescript
import { Paralio } from 'paralio'
import { resolve } from 'path'

interface Paralio<Input, Output> {
  max: number // The limit of running processes
  workerPath: string // Path to the worker script
  workers: number // The number of running workers
  input: Input[] // The input data (unchanged)
  output: Output[] // The output array
  _input: Input[] // The consumed input data
  repl: repl.REPLServer // The exposed REPL server
  /*...*/
}

const app = new Paralio({
  max: 4,
  workerPath: resolve(__dirname, './worker'),
  input: [
    /*Some input data (it has to be an array!)*/
  ],
})

/* Called after initializing all of the workers */
app.on('start', self => {/*...*/})

/* Called after killing all of the workers */
app.on('end', self => {/*...*/})

/* Called when consuming an item */
app.on('consume', ([items_left, consumed_item]) => {/*...*/})
```

## Worker
The class for worker files.
```typescript
import { Worker } from "paralio"

interface Worker<MessageType> {
  constructor()
  onMessage(msg: MessageType): Promise<any> | void
}

new class extends Worker {
  onMessage(msg) {
    /* It can be either a value or a Promise */
    const output = Process_the_input(msg)
    return output
  }
}()
```
# On using the REPL
Paralio comes a built-in repl to make your (my) life easier. It lets you access the app instance and run some useful commands.
## self
You can access the main app instance with the `self` variable. I.e.: `> self.output`
## .save <path>
Let's you save the output to a specified path (defaults to the cwd).
## .rerun
In case you want to rerun your application, here you go!


# Motivation
I was basically scraping some information of the [wikipedia](https://www.wikipedia.org/). It was taking a few minutes to run over **just 54 pages**. So I thought to myself "What can I do to speed it up?" and the obvious answer came to my mind: **multi-threading**. The idea itself was brilliant, but I ran into some problems, namely: overloading my cpu with 54 processes... Then I decided to limit the number of processes data at one time and it worked. After that some improvements came to my mind and bada bim, bada boom - **Paralio** was born. 
declare namespace NodeJS {
  export interface Process {
    on(event: 'mount', handler: () => Promise<any> | void)
    on(event: 'dismount', handler: () => Promise<any> | void)
  }
}

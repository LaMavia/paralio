import Axios from 'axios'
import { JSDOM } from 'jsdom'
import { Worker, s } from '../src'
// import cl from 'cluster'

function onDocJsDom(html: string) {
  const { window } = new JSDOM(html)
  const { document } = window
  return Array.from(document.querySelectorAll('p'))
    .map(p => p.textContent || '')
    .filter(x => /solidarn/gi.test(x)).length > 0
    ? (document.getElementById('firstHeading') as HTMLElement).textContent
    : ''
}

s(
  class extends Worker<string> {
    onMessage(msg: string) {
      return Axios.get(msg)
        .then(r => r.data)
        .then(onDocJsDom)
    }
  }
)

import { Paralio } from '../src'
import { resolve } from 'path'

async function main() {
  const urls: any[] = [
    'https://pl.wikipedia.org/wiki/Stefan_Amsterdamski',
    'https://pl.wikipedia.org/wiki/Stanis%C5%82aw_Bara%C5%84czak',
    'https://pl.wikipedia.org/wiki/W%C5%82adys%C5%82aw_Bartoszewski',
    'https://pl.wikipedia.org/wiki/W%C5%82adys%C5%82aw_Bie%C5%84kowski',
    'https://pl.wikipedia.org/wiki/Jacek_Boche%C5%84ski',
    'https://pl.wikipedia.org/wiki/Marian_Brandys',
    'https://pl.wikipedia.org/wiki/Alina_Brodzka-Wald',
    'https://pl.wikipedia.org/wiki/Tomasz_Burek',
    'https://pl.wikipedia.org/wiki/Andrzej_Celi%C5%84ski',
    'https://pl.wikipedia.org/wiki/Miros%C5%82awa_Chamc%C3%B3wna',
    'https://pl.wikipedia.org/wiki/Bohdan_Cywi%C5%84ski',
    'https://pl.wikipedia.org/wiki/Izydora_D%C4%85mbska',
    'https://pl.wikipedia.org/wiki/Roman_Duda',
    'https://pl.wikipedia.org/wiki/Kornel_Filipowicz',
    'https://pl.wikipedia.org/wiki/Wac%C5%82aw_Gajewski',
    'https://pl.wikipedia.org/wiki/Boles%C5%82aw_Gleichgewicht',
    'https://pl.wikipedia.org/wiki/Micha%C5%82_G%C5%82owi%C5%84ski',
    'https://pl.wikipedia.org/wiki/Antoni_Go%C5%82ubiew',
    'https://pl.wikipedia.org/wiki/Joanna_Guze',
    'https://pl.wikipedia.org/wiki/Stanis%C5%82aw_Hartman',
    'https://pl.wikipedia.org/wiki/Maria_Janion',
    'https://pl.wikipedia.org/wiki/Aldona_Jaw%C5%82owska',
  ]
  const app = new Paralio({
    max: 4,
    workerPath: resolve(__dirname, './worker'),
    input: urls.slice(),
  })

  app.on('end', (self: Paralio<string, string>) => {
    self.output = self.output.filter(x => !!x).sort()
  })

  // app.on('consume', ([rest, item]) => {
  //   console.log(item, rest.length)
  // })
}

main()

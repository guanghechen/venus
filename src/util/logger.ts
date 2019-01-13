import { ColorfulChalkLogger, DEBUG } from 'colorful-chalk-logger'


export const logger: ColorfulChalkLogger = new ColorfulChalkLogger('venus', {
  colorful: true,
  inline: true,
  date: true,
}, process.argv)

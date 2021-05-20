import { ChalkLogger } from '@barusu/chalk-logger'

export const logger = new ChalkLogger(
  {
    name: 'venus',
    colorful: true,
    inline: true,
    date: true,
  },
  process.argv,
)

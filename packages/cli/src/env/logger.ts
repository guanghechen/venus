import { ChalkLogger } from '@guanghechen/chalk-logger'
import { COMMAND_NAME } from './constant'

export const logger = new ChalkLogger(
  {
    name: COMMAND_NAME,
    flags: {
      colorful: true,
      inline: true,
      date: true,
    },
  },
  process.argv,
)

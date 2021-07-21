import ChalkLogger from '@guanghechen/chalk-logger'
import { COMMAND_NAME } from './constant'

const logger = new ChalkLogger(
  {
    name: COMMAND_NAME,
    colorful: true,
    inline: true,
    date: true,
  },
  process.argv,
)

export default logger

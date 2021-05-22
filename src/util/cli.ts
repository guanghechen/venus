import inquirer from 'inquirer'

/**
 * Collect variadic parameters
 *
 * @param arg
 * @param args
 */
export function collectOptionArgs(arg: string, args: string[]): string[] {
  args.push(arg)
  return args
}

/**
 * Prompt a question in command line, ask for a boolean answer.
 * @param description
 * @param defaultValue
 * @returns
 */
export async function yesOrNo(
  description: string,
  defaultValue = false,
): Promise<boolean> {
  const answer = await inquirer.prompt({
    type: 'checkbox',
    name: 'yesOrNo',
    message: description,
    default: defaultValue,
  })
  return answer.yesOrNo
}

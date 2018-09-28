import _ from 'lodash'


export const coverBoolean = (defaultValue: boolean, optionValue?: boolean): boolean => {
  if (_.isBoolean(optionValue)) return optionValue
  return defaultValue
}


export const coverString = (defaultValue: string, optionValue?: string): string => {
  if (_.isString(optionValue)) return optionValue || defaultValue
  return defaultValue
}


export const coverInteger = (defaultValue: number | string, optionValue?: number | string): number => {
  if (_.isString(optionValue) && /^-?\d+$/) optionValue = Number.parseInt(optionValue as string)
  if (_.isInteger(optionValue)) return Number.parseInt(optionValue as string)
  return Number.parseInt(defaultValue as string)
}


export const coverArray = <T> (defaultValues: T[], optionValues?: T[]): T[] => {
  if (_.isArray(optionValues)) return optionValues.length > 0? optionValues: defaultValues
  return defaultValues
}


export const coverObject = (defaultValues: object, optionValues?: object): object => {
  if (optionValues == null) return defaultValues
  return { ...defaultValues, ...optionValues }
}

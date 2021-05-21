import { merge } from '@/util/source-handler/merge'
import { parse } from '@/util/source-handler/parse'

// 移除注释
export const handleRemoveComments = (content: string): string => {
  let sourceItem = parse(content)
  sourceItem.comments = []
  sourceItem = parse(merge(sourceItem))
  return merge(sourceItem)
}

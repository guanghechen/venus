import { merge } from '@/util/source-handler/merge'
import { partition } from '@/util/source-handler/partition'

// 移除注释
export const handleRemoveComments = (content: string): string => {
  let sourceItem = partition(content)
  sourceItem.comments = []
  sourceItem = partition(merge(sourceItem))
  return merge(sourceItem)
}

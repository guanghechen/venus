import merge from '../../../util/source-handler/merge'
import parse from '../../../util/source-handler/parse'

// Remove comments.
function handleRemoveComments(content: string): string {
  let sourceItem = parse(content)
  sourceItem.comments = []
  sourceItem = parse(merge(sourceItem))
  return merge(sourceItem)
}

export default handleRemoveComments

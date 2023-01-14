/**
 * A source content piece
 */
export interface ISourcePiece {
  /**
   * Start position on the source codes.
   */
  start: number
  /**
   * Source contents.
   */
  content: string
}

/**
 * 将源码文件分成三部分内容，其中注释中的明文字符串将不会出现在 literals 中，
 * 同理，明文字符串中的“注释”将不会出现在 comments 中
 *
 * @member sources            源码片段列表
 * @member comments           注释片段列表
 * @member literals           明文字符串列表
 * @member dependencies       依赖
 * @member namespaces         被导入到当前文件中的命名空间
 * @member typedef            类型别名的语句列表
 */
export interface ISourceItem {
  macros: ISourcePiece[]
  sources: ISourcePiece[]
  comments: ISourcePiece[]
  literals: ISourcePiece[]
  dependencies: string[]
  namespaces: string[]
  typedefs: Map<string, string>
}

/**
 * 一个源码片段
 * @attr start      在源码中的起始位置
 * @attr content    源码片段的具体内容
 */
export interface SourcePiece {
  start: number
  content: string
}


/**
 * 将源码文件分成三部分内容，其中注释中的明文字符串将不会出现在 literals 中，
 * 同理，明文字符串中的“注释”将不会出现在 comments 中
 *
 * @attr sources      源码片段列表
 * @attr comments     注释片段列表
 * @attr literals     明文字符串列表
 * @attr dependencies 依赖
 */
export interface SourceItem {
  macros: SourcePiece[]
  sources: SourcePiece[]
  comments: SourcePiece[]
  literals: SourcePiece[]
  dependencies: string[]
}

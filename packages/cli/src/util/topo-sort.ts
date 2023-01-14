export interface ITopoNode {
  value: string
  children: ITopoNode[]
}

/**
 * Calc in-degree of nodes.
 * @param node
 * @param du
 * @param nodeMap
 */
function calcInDegree(
  node: ITopoNode,
  du: Map<string, number>,
  nodeMap: Map<string, ITopoNode>,
): void {
  if (node == null) return
  nodeMap.set(node.value, node)
  for (const o of node.children) {
    if (du.has(o.value)) du.set(o.value, du.get(o.value)! + 1)
    else {
      du.set(o.value, 1)
      calcInDegree(o, du, nodeMap)
    }
  }
}

/**
 * Topo sort
 * @param node
 */
export function toposort(node: ITopoNode): string[] {
  const du = new Map<string, number>()
  const nodeMap = new Map<string, ITopoNode>()
  const values: string[] = []
  const q: string[] = []

  calcInDegree(node, du, nodeMap)
  du.set(node.value, 0)
  for (const [key, val] of du.entries()) {
    if (val === 0) q.push(key)
  }

  while (q.length > 0) {
    const x: string = q.shift()!
    values.push(x)
    const u: ITopoNode = nodeMap.get(x)!
    for (const v of u.children) {
      du.set(v.value, du.get(v.value)! - 1)
      if (du.get(v.value) === 0) q.push(v.value)
    }
  }

  return values
}

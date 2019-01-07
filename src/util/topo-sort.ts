export interface TopoNode {
  value: string
  children: TopoNode[]
}


/**
 * calc degree of nodes.
 * @param node
 * @param du
 * @param nodeMap
 */
function calcDu(node: TopoNode, du: Map<string, number>, nodeMap: Map<string, TopoNode>) {
  if (node == null) return
  nodeMap.set(node.value, node)
  for (let o of node.children) {
    if (du.has(o.value)) du.set(o.value, du.get(o.value)! + 1)
    else {
      du.set(o.value, 1)
      calcDu(o, du, nodeMap)
    }
  }
}


/**
 * topo sort
 * @param node
 */
export function toposort(node: TopoNode): string[] {
  const du = new Map<string, number>()
  const nodeMap = new Map<string, TopoNode>()
  const values: string[] = []
  const q: string[] = []

  calcDu(node, du, nodeMap)
  du.set(node.value, 0)
  for (let [key, val] of du.entries()) {
    if (val === 0) q.push(key)
  }

  while (q.length > 0) {
    let x: string = q.shift()!
    values.push(x)
    let u: TopoNode = nodeMap.get(x)!
    for (let v of u.children) {
      du.set(v.value, du.get(v.value)! - 1)
      if (du.get(v.value) == 0) q.push(v.value)
    }
  }

  return values
}

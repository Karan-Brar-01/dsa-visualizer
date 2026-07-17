export interface AVLTreeNode<T = number> {
  id: string
  value: T
  left: string | null
  right: string | null
  height: number
}

export interface AVLSnapshot {
  root: string | null
  nodeMap: Map<string, AVLTreeNode>
  size: number
}

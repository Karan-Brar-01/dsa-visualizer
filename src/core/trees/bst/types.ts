export interface TreeNode<T = number> {
  id: string
  value: T
  left: string | null
  right: string | null
}

export interface BSTSnapshot {
  root: string | null
  nodeMap: Map<string, TreeNode>
  size: number
}

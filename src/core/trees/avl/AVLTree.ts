// ─────────────────────────────────────────────────────────────────────────────
// src/core/trees/avl/AVLTree.ts
//
// Pure TypeScript implementation of an AVL Tree.
// Handles insert, search, and delete operations with self-balancing.
// Yields AnimationStep sequences for visualization.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import type { OperationResult } from '../../shared/OperationResult'
import type { AnimationStep } from '@/types/animation'
import type { AVLTreeNode, AVLSnapshot } from './types'

export class AVLTree {
  private root: string | null = null
  private nodeMap: Map<string, AVLTreeNode> = new Map()
  private size: number = 0

  private getSnapshot(): AVLSnapshot {
    const mapCopy = new Map<string, AVLTreeNode>()
    this.nodeMap.forEach((node, key) => {
      mapCopy.set(key, { ...node })
    })
    return {
      root: this.root,
      nodeMap: mapCopy,
      size: this.size,
    }
  }

  public reset(): AVLSnapshot {
    this.root = null
    this.nodeMap.clear()
    this.size = 0
    return this.getSnapshot()
  }

  private getHeight(nodeId: string | null): number {
    if (!nodeId) return 0
    return this.nodeMap.get(nodeId)!.height
  }

  private getBalance(nodeId: string | null): number {
    if (!nodeId) return 0
    const node = this.nodeMap.get(nodeId)!
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  private updateHeight(nodeId: string): void {
    const node = this.nodeMap.get(nodeId)!
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right))
  }

  private rightRotate(yId: string, steps: AnimationStep[], stepIndexObj: { val: number }): string {
    const y = this.nodeMap.get(yId)!
    const xId = y.left!
    const x = this.nodeMap.get(xId)!
    const T2Id = x.right

    steps.push({
      stepIndex: stepIndexObj.val++,
      description: `Right rotation on node ${y.value}`,
      highlights: [
        { nodeId: yId, state: 'mutating' },
        { nodeId: xId, state: 'active' }
      ]
    })

    // Perform rotation
    x.right = yId
    y.left = T2Id

    // Update heights
    this.updateHeight(yId)
    this.updateHeight(xId)

    steps.push({
      stepIndex: stepIndexObj.val++,
      description: `Rotation complete. ${x.value} is the new root of this subtree.`,
      highlights: [{ nodeId: xId, state: 'mutating' }]
    })

    return xId
  }

  private leftRotate(xId: string, steps: AnimationStep[], stepIndexObj: { val: number }): string {
    const x = this.nodeMap.get(xId)!
    const yId = x.right!
    const y = this.nodeMap.get(yId)!
    const T2Id = y.left

    steps.push({
      stepIndex: stepIndexObj.val++,
      description: `Left rotation on node ${x.value}`,
      highlights: [
        { nodeId: xId, state: 'mutating' },
        { nodeId: yId, state: 'active' }
      ]
    })

    // Perform rotation
    y.left = xId
    x.right = T2Id

    // Update heights
    this.updateHeight(xId)
    this.updateHeight(yId)

    steps.push({
      stepIndex: stepIndexObj.val++,
      description: `Rotation complete. ${y.value} is the new root of this subtree.`,
      highlights: [{ nodeId: yId, state: 'mutating' }]
    })

    return yId
  }

  public insert(value: number): OperationResult<AVLSnapshot> {
    const steps: AnimationStep[] = []
    const stepIndexObj = { val: 0 }
    
    let isNewNode = false

    const insertRecursive = (nodeId: string | null, val: number): string => {
      if (!nodeId) {
        isNewNode = true
        const newNode: AVLTreeNode = {
          id: uuidv4(),
          value: val,
          left: null,
          right: null,
          height: 1
        }
        this.nodeMap.set(newNode.id, newNode)
        this.size++
        
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Inserting ${val}`,
          highlights: [{ nodeId: newNode.id, state: 'mutating' }],
          nodeSpawnId: newNode.id,
        })
        return newNode.id
      }

      const node = this.nodeMap.get(nodeId)!
      
      steps.push({
        stepIndex: stepIndexObj.val++,
        description: `Comparing ${val} with ${node.value}`,
        highlights: [{ nodeId: nodeId, state: 'comparing' }]
      })

      if (val < node.value) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `${val} < ${node.value}, going left`,
          highlights: [{ nodeId: nodeId, state: 'active' }]
        })
        const newLeft = insertRecursive(node.left, val)
        // Only update if it actually changed to avoid unnecessary pointer mutations
        if (node.left !== newLeft) {
          node.left = newLeft
        }
      } else if (val > node.value) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `${val} > ${node.value}, going right`,
          highlights: [{ nodeId: nodeId, state: 'active' }]
        })
        const newRight = insertRecursive(node.right, val)
        if (node.right !== newRight) {
          node.right = newRight
        }
      } else {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `${val} already exists. Ignoring.`,
          highlights: [{ nodeId: nodeId, state: 'active' }]
        })
        return nodeId // Duplicate values not allowed
      }

      this.updateHeight(nodeId)
      
      const balance = this.getBalance(nodeId)

      // Left Left Case
      if (balance > 1 && val < this.nodeMap.get(node.left!)!.value) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Left-Left) at ${node.value}`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        return this.rightRotate(nodeId, steps, stepIndexObj)
      }

      // Right Right Case
      if (balance < -1 && val > this.nodeMap.get(node.right!)!.value) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Right-Right) at ${node.value}`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        return this.leftRotate(nodeId, steps, stepIndexObj)
      }

      // Left Right Case
      if (balance > 1 && val > this.nodeMap.get(node.left!)!.value) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Left-Right) at ${node.value}`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        node.left = this.leftRotate(node.left!, steps, stepIndexObj)
        return this.rightRotate(nodeId, steps, stepIndexObj)
      }

      // Right Left Case
      if (balance < -1 && val < this.nodeMap.get(node.right!)!.value) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Right-Left) at ${node.value}`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        node.right = this.rightRotate(node.right!, steps, stepIndexObj)
        return this.leftRotate(nodeId, steps, stepIndexObj)
      }

      return nodeId
    }

    if (!this.root) {
      const newNode: AVLTreeNode = {
        id: uuidv4(),
        value,
        left: null,
        right: null,
        height: 1
      }
      this.root = newNode.id
      this.nodeMap.set(newNode.id, newNode)
      this.size++
      steps.push({
        stepIndex: stepIndexObj.val++,
        description: `Tree is empty. Inserting ${value} as root.`,
        highlights: [{ nodeId: newNode.id, state: 'mutating' }],
        nodeSpawnId: newNode.id,
      })
      return {
        kind: 'AVL_INSERT',
        success: true,
        message: `Inserted ${value} as root`,
        complexity: { time: 'O(1)', space: 'O(1)' },
        snapshot: this.getSnapshot(),
        steps,
      }
    }

    const prevSize = this.size
    this.root = insertRecursive(this.root, value)

    return {
      kind: 'AVL_INSERT',
      success: prevSize !== this.size,
      message: prevSize !== this.size ? `Inserted ${value}` : `${value} already exists`,
      complexity: { time: 'O(log n)', space: 'O(log n)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }

  public search(value: number): OperationResult<AVLSnapshot> {
    const steps: AnimationStep[] = []
    let stepIndex = 0
    let currentId = this.root
    let found = false

    if (!currentId) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Tree is empty. Cannot search for ${value}.`,
        highlights: [],
      })
    }

    while (currentId) {
      const current = this.nodeMap.get(currentId)!
      
      steps.push({
        stepIndex: stepIndex++,
        description: `Comparing ${value} with ${current.value}`,
        highlights: [{ nodeId: currentId, state: 'comparing' }],
      })

      if (current.value === value) {
        found = true
        steps.push({
          stepIndex: stepIndex++,
          description: `Found ${value}!`,
          highlights: [{ nodeId: currentId, state: 'found' }],
        })
        break
      } else if (value < current.value) {
        steps.push({
          stepIndex: stepIndex++,
          description: `${value} < ${current.value}, going left`,
          highlights: [{ nodeId: currentId, state: 'active' }],
        })
        currentId = current.left
      } else {
        steps.push({
          stepIndex: stepIndex++,
          description: `${value} > ${current.value}, going right`,
          highlights: [{ nodeId: currentId, state: 'active' }],
        })
        currentId = current.right
      }
    }

    if (!found && this.root) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Reached a leaf. ${value} is not in the tree.`,
        highlights: [],
      })
    }

    return {
      kind: 'AVL_SEARCH',
      success: found,
      message: found ? `Found ${value}` : `${value} not found`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }

  public delete(value: number): OperationResult<AVLSnapshot> {
    const steps: AnimationStep[] = []
    const stepIndexObj = { val: 0 }
    let valueFound = false

    const getMinValueNode = (nodeId: string): string => {
      let currentId = nodeId
      while (this.nodeMap.get(currentId)!.left) {
        currentId = this.nodeMap.get(currentId)!.left!
      }
      return currentId
    }

    const deleteRecursive = (nodeId: string | null, val: number): string | null => {
      if (!nodeId) return null

      const node = this.nodeMap.get(nodeId)!
      
      steps.push({
        stepIndex: stepIndexObj.val++,
        description: `Comparing ${val} with ${node.value} for deletion`,
        highlights: [{ nodeId: nodeId, state: 'comparing' }]
      })

      if (val < node.value) {
        node.left = deleteRecursive(node.left, val)
      } else if (val > node.value) {
        node.right = deleteRecursive(node.right, val)
      } else {
        valueFound = true
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Found ${val} to delete.`,
          highlights: [{ nodeId: nodeId, state: 'deleted' }]
        })

        if (!node.left || !node.right) {
          const temp = node.left ? node.left : node.right
          if (!temp) {
            // No child
            steps.push({
              stepIndex: stepIndexObj.val++,
              description: `Removing leaf node ${node.value}.`,
              highlights: [],
              nodeDespawnId: nodeId
            })
            this.nodeMap.delete(nodeId)
            this.size--
            return null
          } else {
            // One child
            steps.push({
              stepIndex: stepIndexObj.val++,
              description: `Node has one child. Bypassing node ${node.value}.`,
              highlights: [],
              nodeDespawnId: nodeId
            })
            this.nodeMap.delete(nodeId)
            this.size--
            return temp
          }
        } else {
          // Two children
          steps.push({
            stepIndex: stepIndexObj.val++,
            description: `Node has two children. Finding in-order successor.`,
            highlights: [{ nodeId: nodeId, state: 'active' }]
          })
          const tempId = getMinValueNode(node.right)
          const tempNode = this.nodeMap.get(tempId)!
          
          steps.push({
            stepIndex: stepIndexObj.val++,
            description: `Swapping values: ${node.value} ↔ ${tempNode.value}.`,
            highlights: [
              { nodeId: nodeId, state: 'mutating' },
              { nodeId: tempId, state: 'mutating' },
            ],
          })
          
          node.value = tempNode.value
          node.right = deleteRecursive(node.right, tempNode.value)
        }
      }

      if (!nodeId || !this.nodeMap.has(nodeId)) {
        return nodeId
      }

      this.updateHeight(nodeId)
      const balance = this.getBalance(nodeId)

      // Left Left Case
      if (balance > 1 && this.getBalance(node.left) >= 0) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Left-Left) at ${node.value} after deletion`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        return this.rightRotate(nodeId, steps, stepIndexObj)
      }

      // Left Right Case
      if (balance > 1 && this.getBalance(node.left) < 0) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Left-Right) at ${node.value} after deletion`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        node.left = this.leftRotate(node.left!, steps, stepIndexObj)
        return this.rightRotate(nodeId, steps, stepIndexObj)
      }

      // Right Right Case
      if (balance < -1 && this.getBalance(node.right) <= 0) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Right-Right) at ${node.value} after deletion`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        return this.leftRotate(nodeId, steps, stepIndexObj)
      }

      // Right Left Case
      if (balance < -1 && this.getBalance(node.right) > 0) {
        steps.push({
          stepIndex: stepIndexObj.val++,
          description: `Imbalance detected (Right-Left) at ${node.value} after deletion`,
          highlights: [{ nodeId: nodeId, state: 'comparing' }]
        })
        node.right = this.rightRotate(node.right!, steps, stepIndexObj)
        return this.leftRotate(nodeId, steps, stepIndexObj)
      }

      return nodeId
    }

    if (!this.root) {
      steps.push({
        stepIndex: stepIndexObj.val++,
        description: `Tree is empty. Cannot delete.`,
        highlights: [],
      })
      return {
        kind: 'AVL_DELETE',
        success: false,
        message: `${value} not found`,
        complexity: { time: 'O(1)', space: 'O(1)' },
        snapshot: this.getSnapshot(),
        steps,
      }
    }

    this.root = deleteRecursive(this.root, value)

    return {
      kind: 'AVL_DELETE',
      success: valueFound,
      message: valueFound ? `Deleted ${value}` : `${value} not found`,
      complexity: { time: 'O(log n)', space: 'O(log n)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }
}

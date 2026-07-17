// ─────────────────────────────────────────────────────────────────────────────
// src/core/trees/bst/BinarySearchTree.ts
//
// Pure TypeScript implementation of a Binary Search Tree.
// Handles insert, search, and delete operations.
// Yields AnimationStep sequences for visualization.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import type { OperationResult } from '../../shared/OperationResult'
import type { AnimationStep } from '@/types/animation'
import type { TreeNode, BSTSnapshot } from './types'

export class BinarySearchTree {
  private root: string | null = null
  private nodeMap: Map<string, TreeNode> = new Map()
  private size: number = 0

  private getSnapshot(): BSTSnapshot {
    const mapCopy = new Map<string, TreeNode>()
    this.nodeMap.forEach((node, key) => {
      mapCopy.set(key, { ...node })
    })
    return {
      root: this.root,
      nodeMap: mapCopy,
      size: this.size,
    }
  }

  public reset(): BSTSnapshot {
    this.root = null
    this.nodeMap.clear()
    this.size = 0
    return this.getSnapshot()
  }

  public insert(value: number): OperationResult<BSTSnapshot> {
    const steps: AnimationStep[] = []
    let stepIndex = 0

    const newNode: TreeNode = {
      id: uuidv4(),
      value,
      left: null,
      right: null,
    }

    if (!this.root) {
      this.root = newNode.id
      this.nodeMap.set(newNode.id, newNode)
      this.size++

      steps.push({
        stepIndex: stepIndex++,
        description: `Tree is empty. Inserting ${value} as root.`,
        highlights: [{ nodeId: newNode.id, state: 'mutating' }],
        nodeSpawnId: newNode.id,
      })

      return {
        kind: 'BST_INSERT',
        success: true,
        message: `Inserted ${value} as root`,
        complexity: { time: 'O(1)', space: 'O(1)' },
        snapshot: this.getSnapshot(),
        steps,
      }
    }

    let currentId: string = this.root
    let parentId: string | null = null
    let isLeftChild = false

    while (currentId) {
      const current = this.nodeMap.get(currentId)!
      
      steps.push({
        stepIndex: stepIndex++,
        description: `Comparing ${value} with ${current.value}`,
        highlights: [{ nodeId: currentId, state: 'comparing' }],
      })

      parentId = currentId
      if (value < current.value) {
        steps.push({
          stepIndex: stepIndex++,
          description: `${value} < ${current.value}, going left`,
          highlights: [{ nodeId: currentId, state: 'active' }],
        })
        if (!current.left) {
          isLeftChild = true
          break
        }
        currentId = current.left
      } else {
        steps.push({
          stepIndex: stepIndex++,
          description: `${value} >= ${current.value}, going right`,
          highlights: [{ nodeId: currentId, state: 'active' }],
        })
        if (!current.right) {
          isLeftChild = false
          break
        }
        currentId = current.right
      }
    }

    const parent = this.nodeMap.get(parentId!)!
    if (isLeftChild) {
      parent.left = newNode.id
    } else {
      parent.right = newNode.id
    }

    this.nodeMap.set(newNode.id, newNode)
    this.size++

    steps.push({
      stepIndex: stepIndex++,
      description: `Inserting ${value} as ${isLeftChild ? 'left' : 'right'} child of ${parent.value}`,
      highlights: [
        { nodeId: parent.id, state: 'mutating' },
        { nodeId: newNode.id, state: 'mutating' }
      ],
      pointerMutation: {
        sourceId: parent.id,
        oldTargetId: null,
        newTargetId: newNode.id
      },
      nodeSpawnId: newNode.id,
    })

    return {
      kind: 'BST_INSERT',
      success: true,
      message: `Inserted ${value}`,
      complexity: { time: 'O(h)', space: 'O(1)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }

  public search(value: number): OperationResult<BSTSnapshot> {
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
      kind: 'BST_SEARCH',
      success: found,
      message: found ? `Found ${value}` : `${value} not found`,
      complexity: { time: 'O(h)', space: 'O(1)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }

  public delete(value: number): OperationResult<BSTSnapshot> {
    const steps: AnimationStep[] = []
    let stepIndex = 0

    let currentId = this.root
    let parentId: string | null = null
    let isLeftChild = false
    let found = false

    while (currentId) {
      const current = this.nodeMap.get(currentId)!
      
      steps.push({
        stepIndex: stepIndex++,
        description: `Searching for ${value}: comparing with ${current.value}`,
        highlights: [{ nodeId: currentId, state: 'comparing' }],
      })

      if (current.value === value) {
        found = true
        steps.push({
          stepIndex: stepIndex++,
          description: `Found ${value} to delete.`,
          highlights: [{ nodeId: currentId, state: 'deleted' }],
        })
        break
      }

      parentId = currentId
      if (value < current.value) {
        isLeftChild = true
        currentId = current.left
      } else {
        isLeftChild = false
        currentId = current.right
      }
    }

    if (!found || !currentId) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Value ${value} not found. Deletion failed.`,
        highlights: [],
      })
      return {
        kind: 'BST_DELETE',
        success: false,
        message: `${value} not found`,
        complexity: { time: 'O(h)', space: 'O(1)' },
        snapshot: this.getSnapshot(),
        steps,
      }
    }

    const nodeToDelete = this.nodeMap.get(currentId)!

    const replaceNodeInParent = (childId: string | null) => {
      if (!parentId) {
        this.root = childId
        steps.push({
          stepIndex: stepIndex++,
          description: `Replacing root with new child.`,
          highlights: [],
        })
      } else {
        const parent = this.nodeMap.get(parentId)!
        if (isLeftChild) {
          parent.left = childId
        } else {
          parent.right = childId
        }
        steps.push({
          stepIndex: stepIndex++,
          description: `Repointing parent ${parent.value} to bypass deleted node.`,
          highlights: [{ nodeId: parent.id, state: 'mutating' }],
          pointerMutation: {
            sourceId: parent.id,
            oldTargetId: currentId,
            newTargetId: childId
          }
        })
      }
    }

    if (!nodeToDelete.left && !nodeToDelete.right) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Node has no children. Removing leaf.`,
        highlights: [{ nodeId: currentId, state: 'deleted' }],
        nodeDespawnId: currentId,
      })
      replaceNodeInParent(null)
      this.nodeMap.delete(currentId)
      this.size--
    }
    else if (!nodeToDelete.left) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Node has only a right child. Bypassing node.`,
        highlights: [{ nodeId: currentId, state: 'deleted' }],
        nodeDespawnId: currentId,
      })
      replaceNodeInParent(nodeToDelete.right)
      this.nodeMap.delete(currentId)
      this.size--
    }
    else if (!nodeToDelete.right) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Node has only a left child. Bypassing node.`,
        highlights: [{ nodeId: currentId, state: 'deleted' }],
        nodeDespawnId: currentId,
      })
      replaceNodeInParent(nodeToDelete.left)
      this.nodeMap.delete(currentId)
      this.size--
    }
    else {
      steps.push({
        stepIndex: stepIndex++,
        description: `Node has two children. Finding in-order successor.`,
        highlights: [{ nodeId: currentId, state: 'active' }],
      })
      
      let successorParentId = currentId
      let successorId = nodeToDelete.right
      let successor = this.nodeMap.get(successorId)!

      while (successor.left) {
        steps.push({
          stepIndex: stepIndex++,
          description: `Traversing left to find minimum value...`,
          highlights: [{ nodeId: successorId, state: 'active' }],
        })
        successorParentId = successorId
        successorId = successor.left
        successor = this.nodeMap.get(successorId)!
      }

      steps.push({
        stepIndex: stepIndex++,
        description: `Found successor ${successor.value}.`,
        highlights: [{ nodeId: successorId, state: 'comparing' }],
      })

      steps.push({
        stepIndex: stepIndex++,
        description: `Swapping values: ${nodeToDelete.value} ↔ ${successor.value}.`,
        highlights: [
          { nodeId: currentId, state: 'mutating' },
          { nodeId: successorId, state: 'mutating' },
        ],
      })

      nodeToDelete.value = successor.value

      const successorParent = this.nodeMap.get(successorParentId)!
      if (successorParentId === currentId) {
        successorParent.right = successor.right
      } else {
        successorParent.left = successor.right
      }

      steps.push({
        stepIndex: stepIndex++,
        description: `Removing duplicate successor node from its original position.`,
        highlights: [{ nodeId: successorParentId, state: 'mutating' }],
        pointerMutation: {
          sourceId: successorParentId,
          oldTargetId: successorId,
          newTargetId: successor.right
        },
        nodeDespawnId: successorId,
      })

      this.nodeMap.delete(successorId)
      this.size--
    }

    return {
      kind: 'BST_DELETE',
      success: true,
      message: `Deleted ${value}`,
      complexity: { time: 'O(h)', space: 'O(1)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }
}

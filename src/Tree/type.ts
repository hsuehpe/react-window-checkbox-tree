export type Node = {
  value: string;
  label: string;
  checked?: boolean;
  expanded?: boolean;
  children?: Node[];
};

export type NodeToAppend = Node & {
  parentValue: string;
};

export type CheckState = 'checked' | 'unchecked' | 'indeterminate';

export interface FlatNode {
  label: string;
  value: string;
  children?: Node[];
  isParent: boolean;
  isLeaf: boolean;
  isChild: boolean;
  parent: Node;
  treeDepth: number;
  treePath: string;
  index: number;
  checked: boolean;
  expanded: boolean;
  checkState: CheckState;
  visible: boolean;
  loading?: boolean;
  childLeafCount?: number;
}

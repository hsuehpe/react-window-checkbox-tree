import { Node, FlatNode, CheckState } from './type';

export const ROOT_NODE = 'root';

export enum NODE_STATUS {
  CHECKED = 'checked',
  EXPANDED = 'expanded',
  VISIBLE = 'visible',
}

class TreeSelect {
  private flatNodesMap: Record<string, FlatNode>;
  private nodeIndex = 0;

  constructor(initialFlatNodes: Record<string, FlatNode> = {}) {
    this.flatNodesMap = initialFlatNodes;
  }

  private cascadeDown(flatNode: FlatNode, callback?: (node: FlatNode) => void) {
    if (callback) {
      callback(flatNode);
    }
    if (flatNode.children && flatNode.children.length > 0) {
      flatNode.children.forEach((child) => {
        this.cascadeDown(this.getNode(child.value), callback);
      });
    }
  }

  private cascadeUp(flatNode: FlatNode, callback?: (node: FlatNode) => void) {
    if (callback) {
      callback(flatNode);
    }
    if (flatNode.isChild && flatNode.parent) {
      const { parent } = this.getNode(flatNode.value);
      this.cascadeUp(this.getNode(parent.value), callback);
    }
  }

  private nodeHasChildren(node: Node) {
    return Array.isArray(node.children);
  }

  private determineShallowCheckState = (node: Node): CheckState => {
    const flatNode = this.getNode(node.value);
    if (flatNode.isLeaf || !node.children || !node.children.length) {
      return flatNode.checked ? 'checked' : 'unchecked';
    }
    if (this.isEveryVisibleChildChecked(node)) {
      return 'checked';
    }
    if (this.isSomeVisibleChildChecked(node)) {
      return 'indeterminate';
    }
    return 'unchecked';
  };

  private isSomeVisibleChildChecked = (node: Node) => {
    const visibleChildren = node.children
      ? node.children.filter((child) => this.getNode(child.value)?.visible)
      : [];
    return visibleChildren.some((child) => {
      const flatNode = this.getNode(child.value);
      return flatNode?.checkState !== 'unchecked';
    });
  };

  private isEveryVisibleChildChecked = (node: Node) => {
    if (!node.children || !node.children.length) return false;
    const visibleChildren = node.children.filter(
      (child) => this.getNode(child.value)?.visible
    );
    return visibleChildren.every(
      (child) => this.getNode(child.value)?.checkState === 'checked'
    );
  };

  filterNodesByKeyword(keyword: string) {
    const filteredNodes: FlatNode[] = [];

    if (!keyword) {
      Object.keys(this.flatNodesMap).forEach((value) => {
        if (value !== ROOT_NODE)
          this.setNodeStatus(value, NODE_STATUS.VISIBLE, true);
        filteredNodes.push(this.getNode(value));
      });
      return;
    }

    Object.keys(this.flatNodesMap).forEach((value) => {
      if (value !== ROOT_NODE)
        this.setNodeStatus(value, NODE_STATUS.VISIBLE, false);
    });

    Object.keys(this.flatNodesMap).forEach((value) => {
      const node = this.getNode(value);
      if (node.label.toLowerCase().includes(keyword.toLowerCase())) {
        filteredNodes.push(node);
      }
    });

    filteredNodes.forEach((node) => {
      this.cascadeUp(node, (node) =>
        this.setNodeStatus(node.value, NODE_STATUS.VISIBLE, true)
      );
      if (node.children && node.children.length > 0) {
        this.cascadeDown(node, (node) =>
          this.setNodeStatus(node.value, NODE_STATUS.VISIBLE, true)
        );
      }
    });
  }

  getNode(value: string) {
    return this.flatNodesMap[value];
  }

  flattenNodes(nodes?: Node[], parent = {} as FlatNode, depth = 0) {
    if (!Array.isArray(nodes) || nodes.length === 0) return;
    nodes.forEach((node, index) => {
      const { value, label, children, expanded, checked } = node;
      const isParent = this.nodeHasChildren(node);
      const flatNode = {
        label: label ?? '',
        value,
        children,
        isParent,
        isLeaf: !isParent,
        isChild: parent.value !== undefined,
        parent,
        treeDepth: depth,
        treePath: parent.treePath
          ? `${parent.treePath}/${index}.${value}`
          : `/${index}.${value}`,
        index: this.nodeIndex++,
        checked: this.flatNodesMap[value]?.checked ?? checked ?? false,
        expanded:
          value === ROOT_NODE
            ? true
            : this.flatNodesMap[value]?.expanded ?? expanded ?? false,
        visible: true,
        loading: this.flatNodesMap[value]?.loading ?? false,
        childLeafCount: this.flatNodesMap[value]?.childLeafCount ?? 0,
        checkState: checked
          ? ('checked' as CheckState)
          : ('unchecked' as CheckState),
      };
      this.flatNodesMap[value] = flatNode;
      if (children) this.flattenNodes(children, flatNode, depth + 1);
    });
  }

  getAllLeafsNodes() {
    const leafNodes: FlatNode[] = [];

    Object.keys(this.flatNodesMap).forEach((value) => {
      const node = this.getNode(value);
      if (node.isLeaf && node.visible) leafNodes.push(node);
    });
    return leafNodes;
  }

  getCheckedLeafNodes(depth?: number) {
    const checkedLeafNodes: FlatNode[] = [];

    Object.keys(this.flatNodesMap).forEach((value) => {
      const node = this.getNode(value);
      if (node.checked && node.isLeaf) {
        if (depth === node.treeDepth || depth === undefined)
          checkedLeafNodes.push(node);
      }
    });

    return checkedLeafNodes;
  }

  getAllVisibleNodes() {
    const visibleNodes: FlatNode[] = [];

    Object.keys(this.flatNodesMap).forEach((value) => {
      const node = this.getNode(value);
      if (node.visible) visibleNodes.push(node);
    });

    return visibleNodes;
  }

  toggleCheckForNode(node: FlatNode, isChecked: boolean) {
    this.cascadeDown(node, (node) => {
      if (node.visible) {
        this.setNodeStatus(node.value, NODE_STATUS.CHECKED, isChecked);
        node.checkState = this.determineShallowCheckState(node);
      }
    });
  }
  toggleCheckForAllVisibleNodes(isChecked: boolean) {
    const root = this.getNode(ROOT_NODE);
    const visibleNodes = this.getAllVisibleNodes();
    visibleNodes.forEach((node) => {
      this.setNodeStatus(node.value, NODE_STATUS.CHECKED, isChecked);
      node.checkState = this.determineShallowCheckState(node);
    });
    root.checkState = this.determineShallowCheckState(root);
  }

  isAllNodesHidden() {
    if (
      Object.keys(this.flatNodesMap).length === 0 ||
      this.getNode(ROOT_NODE)?.children?.length === 0
    )
      return true;
    const allKeys = Object.keys(this.flatNodesMap).filter(
      (key) => key !== ROOT_NODE
    );
    return allKeys.every((key) => !this.flatNodesMap[key].visible);
  }

  setNodeStatus(
    nodeValue: string,
    nodeStatus: NODE_STATUS,
    toggleValue: boolean
  ) {
    if (this.flatNodesMap && this.flatNodesMap[nodeValue])
      this.flatNodesMap[nodeValue][nodeStatus] = toggleValue;
  }

  expandAllNodes(expand: boolean) {
    const allKeys = Object.keys(this.flatNodesMap);
    allKeys.forEach((key) => {
      if (this.flatNodesMap[key].isParent) {
        this.flatNodesMap[key].expanded = expand;
      }
    });

    return this;
  }

  generateNodesArray(isHideRootNode = false) {
    const nodesArray: FlatNode[] = [];

    const checkIsAnyParentCollapsed = (node: FlatNode): boolean => {
      if (node.parent.value === ROOT_NODE) return false;
      if (!node.parent.expanded) return true;
      return checkIsAnyParentCollapsed(this.getNode(node.parent.value));
    };

    Object.values(this.flatNodesMap)
      .sort((a, b) => a.index - b.index)
      .filter((node) => (isHideRootNode ? node.value !== ROOT_NODE : true))
      .filter(
        (node) =>
          node.visible &&
          (node.value === ROOT_NODE || !checkIsAnyParentCollapsed(node))
      )
      .forEach((node) => {
        nodesArray.push(node);
      });

    for (let i = nodesArray.length - 1; i >= 0; i--) {
      const node = nodesArray[i];
      node.checkState = this.determineShallowCheckState(node);
    }

    return nodesArray;
  }

  reset(nodes: Node[]) {
    this.flatNodesMap = {};
    this.flattenNodes(nodes);
  }
}

export default TreeSelect;

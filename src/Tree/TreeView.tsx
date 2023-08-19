import {
  useCallback,
  useEffect,
  useImperativeHandle,
  ForwardRefRenderFunction,
  forwardRef,
  useState,
  useRef,
  useMemo,
} from 'react';
import TreeSelect, { NODE_STATUS, ROOT_NODE } from './TreeSelect';
import TreeNode from './TreeNode';
import { FlatNode, Node } from './type';
import { FixedSizeList as List } from 'react-window';

export interface TreeViewRef {
  getAllCheckedLeaf: () => {
    value: string;
    label: string;
  }[];
  resetByDefaultCheckedList: () => void;
}
interface TreeViewProps {
  id: string;
  title?: string;
  nodes: Node[];
  onCheck?: () => void;
  onExpand?: (value: string) => void;
  defaultCheckedList?: string[];
  keyword?: string;
  disabled?: boolean;
  isHideRoot?: boolean;
}

// Extracting common logic to a custom hook
const useTreeSelect = (nodes: Node[]) => {
  const treeSelect = new TreeSelect({});
  treeSelect.flattenNodes(nodes);
  return treeSelect;
};

const TreeView: ForwardRefRenderFunction<TreeViewRef, TreeViewProps> = (
  {
    id,
    title,
    nodes,
    onCheck,
    keyword,
    onExpand,
    disabled,
    defaultCheckedList = [],
    isHideRoot,
  },
  ref
) => {
  const tree = useRef<TreeSelect>(useTreeSelect(nodes)).current;
  const [treeNodesArray, setTreeNodesArray] = useState<FlatNode[]>(
    tree.generateNodesArray(isHideRoot)
  );
  console.log(treeNodesArray);
  const [allLeafNodes, setAllLeafNodes] = useState<FlatNode[]>([]);

  const displayTitle = useMemo(() => {
    if (keyword) return `全部搜尋結果：${title}`;
    return title;
  }, [title, keyword]);

  const handleCheck = useCallback(
    ({ value, checked }: { value: string; checked: boolean }) => {
      if (value === ROOT_NODE) {
        tree.toggleCheckForAllVisibleNodes(checked);
      } else {
        tree.toggleCheckForNode(tree.getNode(value), checked);
      }
      console.log(value, checked);
      if (onCheck) {
        onCheck();
      }
      setTreeNodesArray(tree.generateNodesArray(isHideRoot));
    },
    [tree, setTreeNodesArray]
  );

  const handleExpand = useCallback(
    ({ value, expanded }: { value: string; expanded: boolean }) => {
      tree.setNodeStatus(value, NODE_STATUS.EXPANDED, expanded);
      if (onExpand) onExpand(value);
      setTreeNodesArray(tree.generateNodesArray(isHideRoot));
    },
    [tree, setTreeNodesArray]
  );

  const getAllCheckedLeaf = useCallback(() => {
    return tree.getCheckedLeafNodes().map((node) => ({
      value: node.value,
      label: node.label,
    }));
  }, [tree]);

  const resetByDefaultCheckedList = useCallback(() => {
    tree.reset(nodes);
    if (defaultCheckedList && defaultCheckedList.length) {
      for (const value of defaultCheckedList) {
        const flatNode = tree.getNode(value);
        if (flatNode) tree.toggleCheckForNode(flatNode, true);
      }
    }
    setTreeNodesArray(tree.generateNodesArray(isHideRoot));
    setAllLeafNodes(tree.getAllLeafsNodes());
  }, [tree, defaultCheckedList, setTreeNodesArray, setAllLeafNodes]);

  useEffect(() => {
    if (keyword != null) {
      tree.filterNodesByKeyword(keyword);
    }
    setTreeNodesArray(tree.generateNodesArray(isHideRoot));
    setAllLeafNodes(tree.getAllLeafsNodes());
  }, [tree, keyword, setTreeNodesArray, setAllLeafNodes]);

  useEffect(() => {
    resetByDefaultCheckedList();
  }, [defaultCheckedList]);

  useImperativeHandle(
    ref,
    () => ({
      getAllCheckedLeaf,
      resetByDefaultCheckedList,
    }),
    [getAllCheckedLeaf]
  );

  const Node = ({ index }: { index: number }) => {
    const node = treeNodesArray[index];
    const {
      expanded,
      label,
      value,
      isParent,
      treePath,
      visible,
      children,
      treeDepth,
      checkState,
    } = node;

    const childCounts =
      value === ROOT_NODE
        ? tree.getAllLeafsNodes().length
        : children?.filter((child) => tree.getNode(child.value).visible)
            .length ?? 0;

    const paddingLeft = treeDepth > 0 ? 25 + (treeDepth - 1) * 50 : 0;

    return (
      <>
        {visible && (
          <TreeNode
            key={`${treePath}-${value}`}
            value={value}
            label={label}
            checked={checkState}
            expanded={expanded ?? false}
            isHideRoot={isHideRoot}
            hideExpandButton={value === ROOT_NODE}
            onCheck={handleCheck}
            onExpand={handleExpand}
            disabled={disabled}
            isParent={isParent}
            childCounts={childCounts}
            style={{ paddingLeft }}
          />
        )}
      </>
    );
  };

  return (
    <div data-qe-id={`tree-view-${id}`}>
      {title && (
        <div className='font-medium'>{`${displayTitle} (${allLeafNodes.length})`}</div>
      )}
      <List
        height={treeNodesArray.length * 42}
        itemCount={treeNodesArray.length}
        itemSize={42}
        width='100%'
      >
        {Node}
      </List>
    </div>
  );
};

export default forwardRef(TreeView);

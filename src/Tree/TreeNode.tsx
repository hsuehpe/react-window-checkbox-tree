import React, { FC, useCallback } from 'react';
import { Checkbox } from '@nextui-org/react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface TreeNodeProps {
  value: string;
  label: string; // 顯示用的文字
  checked: 'checked' | 'unchecked' | 'indeterminate'; // checked: 勾選, indeterminate: 半勾, unchecked: 未勾選
  expanded: boolean; // 是否展開
  onExpand: (flatNode: { value: string; expanded: boolean }) => void; // 展開的 callback
  onCheck: (flatNode: { value: string; checked: boolean }) => void; // 勾選的 callback
  isParent: boolean; // 是否為父節點
  children?: React.ReactNode; // 子節點
  disabled?: boolean; // 是否 disabled
  childCounts?: number; // 子節點數量
  hideExpandButton?: boolean; // 是否隱藏展開按鈕
  isHideRoot?: boolean; // 是否隱藏根節點
  style?: React.CSSProperties;
}

const checkStateMap = {
  unchecked: true,
  checked: false,
  indeterminate: true,
};

const TreeNode: FC<TreeNodeProps> = ({
  value,
  checked,
  label,
  expanded,
  onCheck,
  onExpand,
  isParent,
  disabled,
  childCounts = 0,
  hideExpandButton = false,
  isHideRoot = false,
  style,
}) => {
  const getCheckState = useCallback(() => checkStateMap[checked], [checked]);

  const handleCheck = useCallback(() => {
    onCheck({ value, checked: getCheckState() });
  }, [onCheck, getCheckState]);

  const renderExpandButton = () => {
    if (!isParent) return null;

    if (expanded) {
      return <IconChevronDown />;
    }

    return <IconChevronUp />;
  };

  return (
    <div
      className={`flex items-center py-2 px-1.5 bg-light-200 hover:bg-light-300 top-0 ${
        value === 'root' && 'sticky'
      } ${isHideRoot && value === 'root' && 'hidden'}`}
      style={style}
    >
      <div
        className={`mr-1.5 ${hideExpandButton ? 'hidden' : 'block ml-1'}`}
        onClick={() => onExpand({ value, expanded: !expanded })}
      >
        {renderExpandButton()}
      </div>
      <span
        style={{
          display: 'inline-flex',
          gap: 4,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
          }}
        >
          <Checkbox
            isSelected={checked === 'checked'}
            isIndeterminate={checked === 'indeterminate'}
            value={value}
            onChange={handleCheck}
            disabled={disabled}
          >
            {label}
          </Checkbox>
        </span>
        {isParent && <span className='text-sm'>({childCounts})</span>}
      </span>
    </div>
  );
};

export default TreeNode;

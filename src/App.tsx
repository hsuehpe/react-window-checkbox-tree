import { NextUIProvider } from '@nextui-org/react';
import TreeView from './Tree/TreeView';
import { nodes } from './mockNodes.ts';
import './App.css';

function App() {
  return (
    <NextUIProvider>
      <div className='overflow-y-auto h-full'>
        <TreeView id='tree-view' nodes={nodes} defaultCheckedList={[]} />
      </div>
    </NextUIProvider>
  );
}
export default App;

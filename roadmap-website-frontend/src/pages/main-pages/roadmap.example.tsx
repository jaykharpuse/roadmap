// components/Roadmap.tsx
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const nodes = [
  {
    id: '1',
    data: { label: 'Backend' },
    position: { x: 0, y: 0 },
    style: { background: '#fef3c7', border: '1px solid #000' }
  },
  {
    id: '2',
    data: { label: 'Pick a Language' },
    position: { x: 200, y: 100 },
  },
  // Add more nodes...
];

const edges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  // Add more edges...
];

const Roadmap = () => {
  return (
    <div style={{ height: 800 }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default Roadmap;

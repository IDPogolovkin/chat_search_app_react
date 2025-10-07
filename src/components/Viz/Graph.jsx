import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

// Принимаем options как пропс для большей гибкости
function Graph({ data, options, onNodeSelect, onEdgeSelect }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || !containerRef.current) return;

        const network = new Network(containerRef.current, data, options);

        network.on('selectNode', (params) => {
            if (params.nodes.length > 0) {
                const node = data.nodes.get(params.nodes[0]);
                onNodeSelect(node);
            }
        });

        network.on('selectEdge', (params) => {
            if (params.edges.length > 0) {
                const edge = data.edges.get(params.edges[0]);
                onEdgeSelect(edge);
            }
        });

        return () => {
            network.destroy();
        };

    }, [data, options, onNodeSelect, onEdgeSelect]);

    return <div ref={containerRef} style={{ height: '600px', border: '1px solid var(--line)', borderRadius: '12px' }} />;
}

export default Graph;
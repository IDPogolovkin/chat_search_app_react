import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

function Graph({ data, onNodeSelect, onEdgeSelect }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || !containerRef.current) return;

        const options = {
            physics: {
                stabilization: true,
                solver: 'forceAtlas2Based',
            },
            interaction: {
                hover: true,
                tooltipDelay: 120,
            },
            nodes: {
                shape: 'dot',
                size: 12,
            },
            edges: {
                arrows: 'to',
                smooth: true,
            },
        };
        const network = new Network(containerRef.current, data, options);

        network.on('selectNode', (params) => {
            if (params.nodes.length > 0) {
                onNodeSelect(params.nodes[0]);
            }
        });

        network.on('selectEdge', (params) => {
            if (params.edges.length > 0) {
                onEdgeSelect(params.edges[0]);
            }
        });

        return () => {
            network.destroy();
        };

    }, [data, onNodeSelect, onEdgeSelect]);

    return <div ref={containerRef} style={{ height: '520px', border: '1px solid var(--line)', borderRadius: '12px' }} />;
}

export default Graph;
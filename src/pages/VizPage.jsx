import { useState } from 'react';
import Graph from '../components/Viz/Graph';
import { api } from '../api/service';
import { escapeHtml } from '../utils/formatters';

function VizPage({ selectedCollection }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Настройте параметры и постройте граф.');
    const [graphData, setGraphData] = useState(null);
    const [sideContent, setSideContent] = useState('Выберите узел или ребро');
    const [stats, setStats] = useState(null);
    const [minWeight, setMinWeight] = useState(2);


    const buildGraph = async () => {
        if (!selectedCollection) {
            setStatus('Пожалуйста, выберите коллекцию.');
            return;
        }
        setIsLoading(true);
        setStatus('Построение графа...');
        setGraphData(null);
        setSideContent('Выберите узел или ребро');
        setStats(null);
        try {
            const params = { collection_name: selectedCollection, limit: 1000, min_edge_weight: minWeight };
            const data = await api.getGraph(params);
            
            setGraphData({
                nodes: data.nodes.map(n => ({...n, title: `Сообщений: ${n.size}`})),
                edges: data.edges.map(e => ({ from: e.source, to: e.target, value: e.weight, label: String(e.weight) }))
            });
            setStats(data.statistics);
            setStatus(`Граф построен. Узлов: ${data.statistics.total_nodes}, Связей: ${data.statistics.total_edges}`);
        } catch (error) {
            setStatus(`Ошибка: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNodeSelect = (nodeId) => {
        const node = graphData.nodes.find(n => n.id === nodeId);
        if (node) {
            setSideContent(`<b>Узел:</b> ${escapeHtml(node.label)}<br/><b>Сообщений:</b> ${node.size}`);
        }
    };
    
    const handleEdgeSelect = (edgeId) => {
        const edge = graphData.edges[edgeId]; // vis-network can use index as ID
        if (edge) {
            const sourceNode = graphData.nodes.find(n => n.id === edge.from);
            const targetNode = graphData.nodes.find(n => n.id === edge.to);
            setSideContent(`<b>Связь:</b> ${escapeHtml(sourceNode.label)} → ${escapeHtml(targetNode.label)}<br/><b>Сообщений:</b> ${edge.value}`);
        }
    };

    const resetGraph = () => {
        setGraphData(null);
        setStatus('Настройте параметры и постройте граф.');
        setSideContent('Выберите узел или ребро');
        setStats(null);
    };

    return (
        <div className="panel">
            <div className="bar">Визуализация</div>
            <div className="controls filters" style={{ borderBottom: 0 }}>
                <input 
                    type="number" 
                    value={minWeight}
                    onChange={(e) => setMinWeight(Number(e.target.value))}
                    min="1"
                    title="Минимальный вес ребра (сообщений)"
                />
                <div className="actions">
                    <button onClick={buildGraph} className="primary" disabled={isLoading || !selectedCollection}>
                        {isLoading ? 'Загрузка...' : 'Построить граф'}
                    </button>
                    <button onClick={resetGraph}>Сброс</button>
                </div>
            </div>
            <div className="stat">{status}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', padding: '12px 14px' }}>
                <Graph data={graphData} onNodeSelect={handleNodeSelect} onEdgeSelect={handleEdgeSelect}/>
                <div style={{ height: '520px', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px', overflow: 'auto' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>Детали</div>
                    <div dangerouslySetInnerHTML={{ __html: sideContent }}></div>
                    <hr />
                    <div style={{ fontWeight: 600, margin: '8px 0 4px' }}>Статистика</div>
                    {stats && <div>
                        <p>Всего сообщений: {stats.total_messages}</p>
                        <p>Уникальных отправителей: {stats.unique_senders}</p>
                        <p>Уникальных получателей: {stats.unique_receivers}</p>
                        <p>Текстовых: {stats.message_types.text || 0}</p>
                        <p>Медиа: {stats.message_types.media || 0}</p>
                        <p>Ссылки: {stats.message_types.link || 0}</p>
                    </div>}
                </div>
            </div>
        </div>
    );
}

export default VizPage;
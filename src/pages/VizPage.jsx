import { useState } from 'react';
import { DataSet } from 'vis-data/peer';
import { api } from '../api/service';
import { escapeHtml } from '../utils/formatters';
import Graph from '../components/Viz/Graph';
import Dashboard from '../components/Viz/Dashboard'; // Импортируем новый компонент

// Функция для обработки данных и преобразования их в формат графа
const processDataForGraph = (messages) => {
    const nodes = new DataSet();
    const edges = new DataSet();
    const userNodeIds = new Map();
    const chatNodeIds = new Map();

    const addUserNode = (name, phone) => {
        const id = phone || name;
        if (!id || userNodeIds.has(id)) return userNodeIds.get(id);
        const nodeId = `user_${id}`;
        nodes.add({ id: nodeId, label: name, group: 'person', title: `Контакт: ${name} (${phone})` });
        userNodeIds.set(id, nodeId);
        return nodeId;
    };

    const addChatNode = (subject, id) => {
        if (!id || chatNodeIds.has(id)) return chatNodeIds.get(id);
        const nodeId = `chat_${id}`;
        nodes.add({ id: nodeId, label: subject, group: 'chat', title: `Чат: ${subject}` });
        chatNodeIds.set(id, nodeId);
        return nodeId;
    };

    const interactions = {};

    messages.forEach(msg => {
        const senderName = msg.sender_name || `User ${msg.sender_phone}`;
        const senderId = addUserNode(senderName, msg.sender_phone);

        const chatSubject = msg.chat_subject || `Чат с ${msg.receiver_name || msg.receiver_phone}`;
        const chatId = addChatNode(chatSubject, msg.chat_id);

        if (senderId && chatId) {
            // Пользователь -> Чат
            const edgeId = `${senderId}_${chatId}`;
            if (!interactions[edgeId]) interactions[edgeId] = { from: senderId, to: chatId, sent: 0 };
            interactions[edgeId].sent += 1;
        }

        // Добавляем получателя как участника чата
        if (!msg.from_me) {
            const receiverName = msg.receiver_name || `User ${msg.receiver_phone}`;
            addUserNode(receiverName, msg.receiver_phone);
        }
    });

    Object.values(interactions).forEach(inter => {
        edges.add({
            from: inter.from,
            to: inter.to,
            value: inter.sent,
            title: `Отправлено ${inter.sent} сообщений`
        });
    });

    return { nodes, edges };
};

// Функция для расчета статистики для дашборда
const processDataForCharts = (messages) => {
    const byPlatform = {};
    const topChats = {};
    const topContacts = {};

    messages.forEach(msg => {
        // Статистика по платформам
        byPlatform[msg.platform] = (byPlatform[msg.platform] || 0) + 1;

        // Статистика по чатам
        const chatSubject = msg.chat_subject || `Чат с ${msg.receiver_name || msg.receiver_phone}`;
        topChats[chatSubject] = (topChats[chatSubject] || 0) + 1;

        // Статистика по контактам
        const sender = msg.sender_name || msg.sender_phone;
        if (sender) topContacts[sender] = (topContacts[sender] || 0) + 1;
        if (!msg.from_me) {
            const receiver = msg.receiver_name || msg.receiver_phone;
            if (receiver) topContacts[receiver] = (topContacts[receiver] || 0) + 1;
        }
    });

    const toSortedArray = (obj) => Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return {
        byPlatform,
        topChats: toSortedArray(topChats).map(([subject, count]) => ({ subject, count })),
        topContacts: toSortedArray(topContacts).map(([name, count]) => ({ name, count })),
    };
};

// Опции для стилизации графа
const graphOptions = {
    groups: {
        person: {
            shape: 'icon',
            icon: { face: "'Font Awesome 5 Free'", code: '\uf007', size: 50, color: '#2563eb' }
        },
        chat: {
            shape: 'icon',
            icon: { face: "'Font Awesome 5 Free'", code: '\uf075', size: 50, color: '#697386' }
        }
    },
    physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: { gravitationalConstant: -50, springLength: 100, springConstant: 0.08, avoidOverlap: 0.5 },
    },
    interaction: { hover: true, tooltipDelay: 200 },
    edges: {
        smooth: true,
        arrows: { to: { enabled: true, scaleFactor: 0.5 } }
    },
};

function VizPage({ selectedCollection }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Настройте фильтры и постройте граф.');
    const [rawMessages, setRawMessages] = useState([]);

    // Состояния для отфильтрованных и обработанных данных
    const [graphData, setGraphData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);

    const [sideContent, setSideContent] = useState('Выберите узел или ребро');

    // Состояния для фильтров
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        platform: 'all',
        messageType: 'all',
    });

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const fetchData = async () => {
        if (!selectedCollection) {
            setStatus('Пожалуйста, выберите коллекцию.');
            return;
        }
        setIsLoading(true);
        setStatus('Загрузка данных...');
        setGraphData(null);
        setDashboardStats(null);
        try {
            const data = await api.getMessagesForAnalysis(selectedCollection, 5000);
            setRawMessages(data);
            setStatus(`Загружено ${data.length} сообщений. Нажмите "Применить фильтры и построить", чтобы отобразить.`);
        } catch (error) {
            setStatus(`Ошибка загрузки: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFiltersAndBuild = () => {
        if (rawMessages.length === 0) {
            setStatus('Сначала загрузите данные.');
            return;
        }

        // Применяем фильтры
        const filtered = rawMessages.filter(msg => {
            const msgDate = new Date(msg.timestamp);
            if (filters.dateFrom && msgDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && msgDate > new Date(filters.dateTo)) return false;
            if (filters.platform !== 'all' && msg.platform !== filters.platform) return false;
            if (filters.messageType === 'media' && !msg.has_media) return false;
            if (filters.messageType === 'link' && !msg.has_link) return false;
            return true;
        });

        setStatus(`Обработано ${filtered.length} сообщений после фильтрации.`);

        // Обрабатываем данные для графа и дашборда
        setGraphData(processDataForGraph(filtered));
        setDashboardStats(processDataForCharts(filtered));
        setSideContent('Выберите узел или ребро');
    };

    const handleNodeSelect = (node) => {
        setSideContent(`<b>${node.group === 'person' ? 'Контакт' : 'Чат'}:</b> ${escapeHtml(node.label)}`);
    };

    const handleEdgeSelect = (edge) => {
        setSideContent(edge.title);
    };

    return (
        <div className="panel">
            <div className="bar">Фильтры и управление</div>
            <div className="controls filters">
                <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
                <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
                <select name="platform" value={filters.platform} onChange={handleFilterChange}>
                    <option value="all">Все платформы</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                </select>
                <select name="messageType" value={filters.messageType} onChange={handleFilterChange}>
                    <option value="all">Все типы</option>
                    <option value="media">С медиа</option>
                    <option value="link">Со ссылками</option>
                </select>
                <div className="actions">
                    <button onClick={fetchData} className="primary" disabled={isLoading || !selectedCollection}>
                        {isLoading ? 'Загрузка...' : '1. Загрузить данные'}
                    </button>
                    <button onClick={applyFiltersAndBuild} disabled={rawMessages.length === 0}>
                        2. Построить
                    </button>
                </div>
            </div>
            <div className="stat">{status}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', padding: '12px 14px' }}>
                <div>
                    <Graph data={graphData} options={graphOptions} onNodeSelect={handleNodeSelect} onEdgeSelect={handleEdgeSelect} />
                    <div style={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '10px', marginTop: '10px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px' }}>Детали</div>
                        <div dangerouslySetInnerHTML={{ __html: sideContent }}></div>
                    </div>
                </div>
                <Dashboard stats={dashboardStats} />
            </div>
        </div>
    );
}

export default VizPage;
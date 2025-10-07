const TABS = [
    { id: 'search', label: 'Информация' },
    { id: 'viz', label: 'Визуализация' },
    { id: 'forensics', label: 'Криминалистика' },
];

function Tabs({ activeTab, setActiveTab }) {
    return (
        <div className="tabs">
            {TABS.map(tab => (
                <div
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.label}
                </div>
            ))}
        </div>
    );
}

export default Tabs;
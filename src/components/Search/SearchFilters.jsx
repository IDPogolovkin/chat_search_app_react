
function SearchFilters({ filters, setFilters, onReset }) {
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFilters(prev => ({ ...prev, [id]: value }));
    };

    return (
        <>
            <div className="bar">Фильтры</div>
            <div className="controls filters">
                <select id="platform" value={filters.platform} onChange={handleChange}>
                    <option value="all">Все приложения</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                </select>
                <select id="mode" value={filters.mode} onChange={handleChange}>
                    <option value="semantic">Семантический</option>
                    <option value="text">Текстовый</option>
                </select>
                <select id="message_type_filter" value={filters.message_type_filter} onChange={handleChange}>
                    <option value="all">Любой тип</option>
                    <option value="text">Текст</option>
                    <option value="media">Медиа</option>
                    <option value="link">Ссылка</option>
                </select>
                <select id="from_me" value={filters.from_me} onChange={handleChange}>
                    <option value="">Любое направление</option>
                    <option value="false">Полученные</option>
                    <option value="true">Отправленные</option>
                </select>
                <input id="date_from" type="date" value={filters.date_from} onChange={handleChange} />
                <input id="date_to" type="date" value={filters.date_to} onChange={handleChange} />
                <div className="actions"><button onClick={onReset}>Сброс</button></div>
            </div>
        </>
    );
}

export default SearchFilters;
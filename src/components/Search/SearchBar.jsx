
function SearchBar({ searchParams, setSearchParams, collections, selectedCollection, setSelectedCollection, onSearch, isLoading }) {
    const handleChange = (e) => {
        const { id, value } = e.target;
        setSearchParams(prev => ({ ...prev, [id]: value }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <>
            <div className="bar">Поиск</div>
            <div className="controls search">
                <input id="query" type="text" placeholder="Введите запрос" value={searchParams.query} onChange={handleChange} onKeyDown={handleKeyDown} />
                <input id="sender_name" type="text" placeholder="Имя отправителя" value={searchParams.sender_name} onChange={handleChange} />
                <input id="receiver_name" type="text" placeholder="Имя получателя" value={searchParams.receiver_name} onChange={handleChange} />
                <input id="chat_subject" type="text" placeholder="Тема чата" value={searchParams.chat_subject} onChange={handleChange} />
                <input id="limit" type="number" min="1" max="100" value={searchParams.limit} onChange={handleChange} />
                <select id="collection" value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}>
                    <option value="">Выберите коллекцию</option>
                    {collections.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <div className="actions">
                    <button onClick={onSearch} className="primary" disabled={isLoading || !selectedCollection}>Найти</button>
                </div>
            </div>
        </>
    );
}

export default SearchBar;
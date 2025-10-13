import { useState, useEffect, useCallback } from 'react';
import SearchFilters from '../components/Search/SearchFilters';
import SearchBar from '../components/Search/SearchBar';
import ResultsTable from '../components/Results/ResultsTable';
import Pagination from '../components/Results/Pagination';
import { api } from '../api/service';

const INITIAL_FILTERS = {
    platform: 'all',
    mode: 'semantic',
    message_type_filter: 'all',
    from_me: '',
    date_from: '',
    date_to: '',
};

const INITIAL_SEARCH_PARAMS = {
    query: '',
    sender_name: '',
    receiver_name: '',
    chat_subject: '',
    limit: 25,
};

function SearchPage({ collections, selectedCollection, setSelectedCollection }) {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [searchParams, setSearchParams] = useState(INITIAL_SEARCH_PARAMS);
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('Выберите коллекцию для начала работы.');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [pagination, setPagination] = useState({
        currentOffset: null,
        nextOffset: null,
        offsetStack: [],
    });

    const areAdditionalParamsDefault = useCallback(() => {
        return Object.entries(searchParams).every(([key, value]) => 
            key === 'query' || key === 'limit' || value === INITIAL_SEARCH_PARAMS[key]
        );
    }, [searchParams]);

    const areFiltersOnlyPlatform = useCallback(() => {
        return Object.entries(filters).every(([key, value]) => 
            key === 'platform' || value === INITIAL_FILTERS[key]
        );
    }, [filters]);

    const loadMessages = useCallback(async (offset = null) => {
        if (!selectedCollection) return;
        setIsLoading(true);
        setStatus('Загрузка...');
        try {
            const params = {};
            if (searchParams.limit) params.limit = Number(searchParams.limit);
            if (offset) params.offset = offset;
            if (filters.platform !== 'all') params.platform = filters.platform;

            const query = new URLSearchParams(params);
            const data = await api.getMessages(selectedCollection, query);
            setResults(data.items || []);
            setPagination(prev => ({ ...prev, nextOffset: data.offset }));
            setStatus(`Показано: ${data.items?.length || 0} сообщений.`);
        } catch (error) {
            setStatus(`Ошибка: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCollection, searchParams.limit, filters.platform]);

    useEffect(() => {
        setIsSearchActive(false);
        setResults([]);
        setPagination({ currentOffset: null, nextOffset: null, offsetStack: [] });
        if (selectedCollection) {
            loadMessages();
        } else {
            setStatus('Выберите коллекцию для начала работы.');
        }
    }, [selectedCollection, loadMessages]);

    const handleSearch = useCallback(async () => {
        if (!selectedCollection) {
            setStatus('Пожалуйста, выберите коллекцию.');
            return;
        }

        if (!searchParams.query.trim() && areAdditionalParamsDefault() && areFiltersOnlyPlatform()) {
            loadMessages();
            setIsSearchActive(false);
            return;
        }

        setIsLoading(true);
        setIsSearchActive(true);
        setStatus('Поиск...');
        setResults([]);

        const body = {
            collection_name: selectedCollection,
            ...filters,
            ...searchParams,
        };
        // Clean up empty fields before sending
        Object.keys(body).forEach(key => {
            if (body[key] === '' || body[key] === 'all') {
                delete body[key];
            }
        });
        if ('from_me' in body) body.from_me = body.from_me === 'true';
        if ('limit' in body && !body.limit) delete body.limit;

        try {
            const data = await api.search(body);
            setResults(data.results || []);
            setStatus(`Найдено: ${data.total_results} • ${Math.round(data.processing_time_ms)} мс • режим: ${data.mode}`);
        } catch (error) {
            setStatus(`Ошибка поиска: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCollection, filters, searchParams, loadMessages, areAdditionalParamsDefault, areFiltersOnlyPlatform]);

    useEffect(() => {
        if (selectedCollection && !isLoading) {
            handleSearch();
        }
    }, [filters, selectedCollection, isLoading, handleSearch]);

    const handleReset = () => {
        setFilters(INITIAL_FILTERS);
        setSearchParams(INITIAL_SEARCH_PARAMS);
        setIsSearchActive(false);
        if (selectedCollection) {
            loadMessages();
        }
    };

    return (
        <div className="panel">
            <SearchFilters filters={filters} setFilters={setFilters} onReset={handleReset} />
            <SearchBar
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                collections={collections}
                selectedCollection={selectedCollection}
                setSelectedCollection={setSelectedCollection}
                onSearch={handleSearch}
                isLoading={isLoading}
            />
            <div className="stat">{status}</div>
            <ResultsTable results={results} />
            <Pagination
                pagination={pagination}
                setPagination={setPagination}
                onPageChange={loadMessages}
                isSearchActive={isSearchActive}
            />
        </div>
    );
}

export default SearchPage;
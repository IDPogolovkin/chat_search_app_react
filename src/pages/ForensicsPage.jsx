import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/service';
import CategoryCard from '../components/Forensics/CategoryCard';
import ForensicsResults from '../components/Forensics/ForensicsResults';

// Hardcoded categories as the summary endpoint is removed
const FORENSICS_CATEGORIES = [
    { name: "кража", keywords: ["кража", "украли"] },
    { name: "обман", keywords: ["обман", "обманули"] },
    { name: "мошенничество", keywords: ["мошенничество", "мошенник"] },
    { name: "манипуляция", keywords: ["манипуляция", "манипулировать"] },
    { name: "угроза", keywords: ["угроза", "угрожает"] },
    { name: "насилие", keywords: ["насилие", "избил"] },
];

function ForensicsPage({ selectedCollection }) {
    const [view, setView] = useState('summary'); // 'summary', 'forensics_results', 'guard_results'
    const [currentCategory, setCurrentCategory] = useState(null);
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [guardCategories, setGuardCategories] = useState([]);
    const [forensicsSearchMode, setForensicsSearchMode] = useState('text');

    useEffect(() => {
        if (selectedCollection) {
            api.getGuardSummary()
                .then(data => setGuardCategories(data.categories || []))
                .catch(err => console.error("Failed to load Guard categories", err));
        } else {
            setGuardCategories([]);
        }
        // Reset view when collection changes
        setView('summary');
    }, [selectedCollection]);

    const searchForensics = useCallback(async (categoryName, mode) => {
        if (!selectedCollection) return;
        setIsLoading(true);
        setStatus('Поиск...');
        setResults([]);
        try {
            const params = { collection_name: selectedCollection, category: categoryName, limit: 100, mode };
            const data = await api.getForensics(params);
            setResults(data.results || []);
            setStatus(`Найдено: ${data.total_results} • ${Math.round(data.processing_time_ms)} мс`);
        } catch (error) {
            setStatus(`Ошибка: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCollection]);

    const searchGuard = useCallback(async (categoryName) => {
        if (!selectedCollection) return;
        setIsLoading(true);
        setStatus('Поиск с помощью AI...');
        setResults([]);
        try {
            const params = { collection_name: selectedCollection, category: categoryName, limit: 100 };
            const data = await api.searchGuard(params);
            setResults(data.matches || []);
            setStatus(`Просканировано: ${data.total_scanned}. Найдено: ${data.total_matches} • ${Math.round(data.processing_time_ms)} мс`);
        } catch (error) {
            setStatus(`Ошибка: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCollection]);

    useEffect(() => {
        if (view === 'forensics_results' && currentCategory) {
            searchForensics(currentCategory.name, forensicsSearchMode);
        }
    }, [forensicsSearchMode, view, currentCategory, searchForensics]);


    const handleForensicsClick = (category) => {
        setCurrentCategory(category);
        setView('forensics_results');
    };

    const handleGuardClick = (category) => {
        setCurrentCategory(category);
        setView('guard_results');
        searchGuard(category.name);
    };

    const handleBack = () => {
        setView('summary');
        setCurrentCategory(null);
        setResults([]);
        setStatus('');
    };

    if (!selectedCollection) {
        return <div className="panel"><div className="stat">Пожалуйста, выберите коллекцию во вкладке "Информация".</div></div>
    }

    if (view === 'forensics_results') {
        return (
            <div className="panel">
                <ForensicsResults
                    title={`Категория: "${currentCategory?.name}"`}
                    onBack={handleBack}
                    status={status}
                    results={results}
                >
                    <label htmlFor="forensics-mode" style={{ fontWeight: 'normal', fontSize: '13px' }}>Режим:</label>
                    <select
                        id="forensics-mode"
                        value={forensicsSearchMode}
                        onChange={e => setForensicsSearchMode(e.target.value)}
                        style={{ height: '28px', borderRadius: '6px', padding: '0 5px' }}
                    >
                        <option value="text">Текстовый</option>
                        <option value="semantic">Семантический</option>
                    </select>
                </ForensicsResults>
            </div>
        );
    }

    if (view === 'guard_results') {
        return (
            <div className="panel">
                <ForensicsResults
                    title={`AI Guard: "${currentCategory?.name}"`}
                    onBack={handleBack}
                    status={status}
                    results={results}
                    isGuard={true}
                />
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="bar">Специальные категории (по ключевым словам)</div>
            <div className="forensics-grid">
                {FORENSICS_CATEGORIES.map(cat => <CategoryCard key={cat.name} category={cat} onClick={handleForensicsClick} />)}
            </div>

            <hr className="section-divider" />

            <div className="bar">Категории угроз (AI Guard)</div>
            <div className="forensics-grid">
                {guardCategories.length > 0
                    ? guardCategories.map(cat => <CategoryCard key={cat.code} category={cat} onClick={handleGuardClick} />)
                    : <p>Загрузка AI категорий...</p>
                }
            </div>
        </div>
    );
}

export default ForensicsPage;
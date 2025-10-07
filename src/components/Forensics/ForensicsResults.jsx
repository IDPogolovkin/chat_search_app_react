import ResultsTable from '../Results/ResultsTable';

function ForensicsResults({ title, onBack, status, results, children, isGuard = false }) {
    return (
        <div>
            <div className="bar">
                <span>{title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {children}
                    <button onClick={onBack} style={{ height: '28px', padding: '0 12px' }}>Назад</button>
                </div>
            </div>
            <div className="stat">{status}</div>
            <ResultsTable results={results} isGuard={isGuard} />
        </div>
    );
}

export default ForensicsResults;
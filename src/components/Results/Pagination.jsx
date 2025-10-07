
function Pagination({ pagination, setPagination, onPageChange, isSearchActive }) {
    if (isSearchActive) {
        return null;
    }

    const handlePrev = () => {
        if (pagination.offsetStack.length > 0) {
            const newStack = [...pagination.offsetStack];
            const prevOffset = newStack.pop();
            setPagination(prev => ({ ...prev, currentOffset: prevOffset, offsetStack: newStack }));
            onPageChange(prevOffset);
        }
    };

    const handleNext = () => {
        const newOffset = pagination.nextOffset;
        setPagination(prev => ({
            ...prev,
            currentOffset: newOffset,
            offsetStack: [...prev.offsetStack, prev.currentOffset],
        }));
        onPageChange(newOffset);
    };

    return (
        <div className="pager">
            <button onClick={handlePrev} disabled={pagination.offsetStack.length === 0}>Назад</button>
            <button onClick={handleNext} disabled={!pagination.nextOffset}>Вперёд</button>
        </div>
    );
}

export default Pagination;
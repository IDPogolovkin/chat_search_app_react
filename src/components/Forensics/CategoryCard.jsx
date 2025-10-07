
function CategoryCard({ category, onClick }) {
    return (
        <div className="forensics-card" onClick={() => onClick(category)}>
            <div className="forensics-card-name">{category.name}</div>
            {category.count != null && <div className="forensics-card-count">{category.count}</div>}
        </div>
    );
}

export default CategoryCard;
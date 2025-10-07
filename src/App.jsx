import { useState, useEffect } from 'react';
import Tabs from './components/Layout/Tabs';
import SearchPage from './pages/SearchPage';
import VizPage from './pages/VizPage';
import ForensicsPage from './pages/ForensicsPage';
import { api } from './api/service';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');

  useEffect(() => {
    api.getCollections()
      .then(data => setCollections(data || []))
      .catch(error => console.error("Failed to load collections:", error));
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage
          collections={collections}
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
        />;
      case 'viz':
        return <VizPage selectedCollection={selectedCollection} />;
      case 'forensics':
        return <ForensicsPage selectedCollection={selectedCollection} />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderActivePage()}
    </div>
  );
}

export default App;
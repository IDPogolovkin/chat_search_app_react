class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async _fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`API Error fetching ${url}:`, error);
            throw error;
        }
    }

    getCollections() {
        return this._fetch('/collections');
    }

    getMessages(collectionName, params) {
        const query = new URLSearchParams(params);
        return this._fetch(`/messages?collection_name=${collectionName}&${query.toString()}`);
    }

    search(params) {
        return this._fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
    }
    
    getForensics(params) {
        const query = new URLSearchParams(params);
        return this._fetch(`/forensics/search?${query.toString()}`);
    }

    getGuardSummary() {
        return this._fetch('/guard/summary');
    }

    searchGuard(params) {
         const query = new URLSearchParams(params);
         return this._fetch(`/guard/search?${query.toString()}`, { method: 'POST' });
    }

    getGraph(params) {
        const query = new URLSearchParams(params);
        return this._fetch(`/graph?${query.toString()}`);
    }
}

export const api = new ApiService('http://localhost:8000');
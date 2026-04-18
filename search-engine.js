/**
 * DigitalStark Aachen - Advanced Search & Filtering Engine
 * Full-text search, fuzzy matching, faceted search, and aggregations
 */

'use strict';

/**
 * Index - Tokenized search index
 */
class Index {
    constructor(name = 'default') {
        this.name = name;
        this.documents = new Map();
        this.invertedIndex = new Map();
        this.docCount = 0;
    }

    addDocument(docId, content, metadata = {}) {
        const tokens = this._tokenize(content);

        const doc = {
            id: docId,
            content,
            tokens,
            metadata,
            addedAt: Date.now(),
            popularity: 0,
        };

        this.documents.set(docId, doc);

        // Update inverted index
        for (const token of tokens) {
            if (!this.invertedIndex.has(token)) {
                this.invertedIndex.set(token, new Set());
            }
            this.invertedIndex.get(token).add(docId);
        }

        this.docCount++;
        return doc;
    }

    removeDocument(docId) {
        const doc = this.documents.get(docId);
        if (!doc) return false;

        for (const token of doc.tokens) {
            const docs = this.invertedIndex.get(token);
            if (docs) {
                docs.delete(docId);
                if (docs.size === 0) {
                    this.invertedIndex.delete(token);
                }
            }
        }

        this.documents.delete(docId);
        this.docCount--;
        return true;
    }

    search(query, options = {}) {
        const { limit = 10, fuzzy = true, boost = {} } = options;

        const tokens = this._tokenize(query);
        const results = new Map();

        for (const token of tokens) {
            let matches = this.invertedIndex.get(token) || new Set();

            if (fuzzy && matches.size === 0) {
                matches = this._fuzzySearch(token);
            }

            for (const docId of matches) {
                const score = (results.get(docId) || 0) + 1;
                results.set(docId, score);
            }
        }

        // Apply boost
        for (const [docId, field] of Object.entries(boost)) {
            if (results.has(docId)) {
                results.set(docId, results.get(docId) * field);
            }
        }

        // Sort by score and return
        return Array.from(results.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([docId, score]) => ({
                id: docId,
                score,
                doc: this.documents.get(docId),
            }));
    }

    _tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(t => t.length > 0);
    }

    _fuzzySearch(token, maxDistance = 2) {
        const results = new Set();

        for (const [indexToken, docs] of this.invertedIndex.entries()) {
            if (this._levenshteinDistance(token, indexToken) <= maxDistance) {
                for (const doc of docs) {
                    results.add(doc);
                }
            }
        }

        return results;
    }

    _levenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    getStats() {
        return {
            documentCount: this.docCount,
            indexSize: this.invertedIndex.size,
            averageTokensPerDoc: this.docCount > 0
                ? Array.from(this.documents.values()).reduce((sum, d) => sum + d.tokens.length, 0) / this.docCount
                : 0,
        };
    }
}

/**
 * Filter - Field-based filtering
 */
class Filter {
    constructor(name) {
        this.name = name;
        this.conditions = [];
    }

    where(field, operator, value) {
        this.conditions.push({ field, operator, value });
        return this;
    }

    in(field, values) {
        this.conditions.push({ field, operator: 'in', value: values });
        return this;
    }

    range(field, min, max) {
        this.conditions.push({ field, operator: 'range', value: { min, max } });
        return this;
    }

    apply(documents) {
        return documents.filter(doc => this._evaluateConditions(doc));
    }

    _evaluateConditions(doc) {
        return this.conditions.every(condition => this._evaluateCondition(doc, condition));
    }

    _evaluateCondition(doc, condition) {
        const value = this._getNestedValue(doc, condition.field);

        switch (condition.operator) {
            case '=':
            case 'eq':
                return value === condition.value;
            case '!=':
            case 'ne':
                return value !== condition.value;
            case '>':
            case 'gt':
                return value > condition.value;
            case '>=':
            case 'gte':
                return value >= condition.value;
            case '<':
            case 'lt':
                return value < condition.value;
            case '<=':
            case 'lte':
                return value <= condition.value;
            case 'in':
                return condition.value.includes(value);
            case 'range':
                return value >= condition.value.min && value <= condition.value.max;
            case 'contains':
                return String(value).includes(String(condition.value));
            case 'startsWith':
                return String(value).startsWith(String(condition.value));
            case 'endsWith':
                return String(value).endsWith(String(condition.value));
            default:
                return true;
        }
    }

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}

/**
 * Facet - Field-based aggregation and categorization
 */
class Facet {
    constructor(field) {
        this.field = field;
        this.buckets = new Map();
    }

    aggregate(documents) {
        this.buckets.clear();

        for (const doc of documents) {
            const value = this._getNestedValue(doc, this.field);
            const bucket = this.buckets.get(value) || { value, count: 0, docs: [] };
            bucket.count++;
            bucket.docs.push(doc.id || doc);
            this.buckets.set(value, bucket);
        }

        return Array.from(this.buckets.values()).sort((a, b) => b.count - a.count);
    }

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    getTopValues(limit = 10) {
        return Array.from(this.buckets.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}

/**
 * SearchEngine - Main search and filtering engine
 */
const SearchEngine = {
    indices: new Map(),
    filters: new Map(),
    facets: new Map(),
    cache: new Map(),
    cacheTTL: 5 * 60 * 1000,

    createIndex: (name) => {
        const index = new Index(name);
        SearchEngine.indices.set(name, index);
        return index;
    },

    getIndex: (name) => SearchEngine.indices.get(name) || SearchEngine.createIndex(name),

    addDocument: (indexName, docId, content, metadata = {}) => {
        const index = SearchEngine.getIndex(indexName);
        SearchEngine._invalidateCache();
        return index.addDocument(docId, content, metadata);
    },

    removeDocument: (indexName, docId) => {
        const index = SearchEngine.getIndex(indexName);
        SearchEngine._invalidateCache();
        return index.removeDocument(docId);
    },

    search: (indexName, query, options = {}) => {
        const cacheKey = `${indexName}:${query}:${JSON.stringify(options)}`;
        const cached = SearchEngine._getFromCache(cacheKey);
        if (cached) return cached;

        const index = SearchEngine.getIndex(indexName);
        const results = index.search(query, options);

        SearchEngine._setInCache(cacheKey, results);
        return results;
    },

    createFilter: (name) => {
        const filter = new Filter(name);
        SearchEngine.filters.set(name, filter);
        return filter;
    },

    getFilter: (name) => SearchEngine.filters.get(name),

    createFacet: (name, field) => {
        const facet = new Facet(field);
        SearchEngine.facets.set(name, facet);
        return facet;
    },

    getFacet: (name) => SearchEngine.facets.get(name),

    aggregateFacets: (documents, facetNames = []) => {
        const results = {};

        for (const facetName of facetNames) {
            const facet = SearchEngine.getFacet(facetName);
            if (facet) {
                results[facetName] = facet.aggregate(documents);
            }
        }

        return results;
    },

    advancedSearch: (indexName, query, filterName = null, facetNames = []) => {
        // Get search results
        let results = SearchEngine.search(indexName, query);
        const documents = results.map(r => r.doc);

        // Apply filter
        if (filterName) {
            const filter = SearchEngine.getFilter(filterName);
            if (filter) {
                documents = filter.apply(documents);
            }
        }

        // Aggregate facets
        const facets = SearchEngine.aggregateFacets(documents, facetNames);

        return {
            results: documents,
            totalCount: documents.length,
            facets,
        };
    },

    _getFromCache: (key) => {
        const entry = SearchEngine.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            SearchEngine.cache.delete(key);
            return null;
        }

        return entry.data;
    },

    _setInCache: (key, data) => {
        SearchEngine.cache.set(key, {
            data,
            expiresAt: Date.now() + SearchEngine.cacheTTL,
        });
    },

    _invalidateCache: () => {
        SearchEngine.cache.clear();
    },

    clearIndex: (name) => {
        SearchEngine.indices.delete(name);
        SearchEngine._invalidateCache();
    },

    getStats: (indexName = null) => {
        if (indexName) {
            const index = SearchEngine.getIndex(indexName);
            return index.getStats();
        }

        return {
            indices: SearchEngine.indices.size,
            filters: SearchEngine.filters.size,
            facets: SearchEngine.facets.size,
            cacheSize: SearchEngine.cache.size,
        };
    },
};

/**
 * Query Builder - Fluent query construction
 */
class QueryBuilder {
    constructor(indexName) {
        this.indexName = indexName;
        this.query = null;
        this.filterName = null;
        this.facetNames = [];
        this.limit = 10;
        this.offset = 0;
    }

    search(query) {
        this.query = query;
        return this;
    }

    filter(filterName) {
        this.filterName = filterName;
        return this;
    }

    facets(...names) {
        this.facetNames = names;
        return this;
    }

    limit(limit) {
        this.limit = limit;
        return this;
    }

    offset(offset) {
        this.offset = offset;
        return this;
    }

    execute() {
        if (!this.query) {
            throw new Error('Search query required');
        }

        const results = SearchEngine.advancedSearch(
            this.indexName,
            this.query,
            this.filterName,
            this.facetNames
        );

        return {
            ...results,
            limit: this.limit,
            offset: this.offset,
            results: results.results.slice(this.offset, this.offset + this.limit),
        };
    }
}

/**
 * Search Suggestions - Autocomplete and suggestions
 */
const SearchSuggestions = {
    suggestions: new Map(),

    addSuggestion: (term, metadata = {}) => {
        if (!SearchSuggestions.suggestions.has(term)) {
            SearchSuggestions.suggestions.set(term, {
                term,
                frequency: 0,
                lastUsed: Date.now(),
                ...metadata,
            });
        }

        const suggestion = SearchSuggestions.suggestions.get(term);
        suggestion.frequency++;
        suggestion.lastUsed = Date.now();
    },

    getSuggestions: (prefix, limit = 10) => {
        const results = [];

        for (const [term, data] of SearchSuggestions.suggestions.entries()) {
            if (term.startsWith(prefix.toLowerCase())) {
                results.push(data);
            }
        }

        return results
            .sort((a, b) => b.frequency - a.frequency || b.lastUsed - a.lastUsed)
            .slice(0, limit);
    },

    clearSuggestions: () => {
        SearchSuggestions.suggestions.clear();
    },

    getStats: () => ({
        totalSuggestions: SearchSuggestions.suggestions.size,
        suggestions: Array.from(SearchSuggestions.suggestions.values()),
    }),
};

/**
 * Initialize search engine
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Search Engine initialized');

    // Add track search suggestions
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && e.target.type === 'search') {
            SearchSuggestions.addSuggestion(e.target.value);
        }
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Index,
        Filter,
        Facet,
        SearchEngine,
        QueryBuilder,
        SearchSuggestions,
    };
}

window.Index = Index;
window.Filter = Filter;
window.Facet = Facet;
window.SearchEngine = SearchEngine;
window.QueryBuilder = QueryBuilder;
window.SearchSuggestions = SearchSuggestions;

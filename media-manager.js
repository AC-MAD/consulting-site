/**
 * DigitalStark Aachen - Advanced Media Management System
 * Image optimization, lazy loading, responsive images, and media processing
 */

'use strict';

/**
 * MediaFile - Represents a media asset with metadata
 */
class MediaFile {
    constructor(id, name, type, size, url) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.size = size;
        this.url = url;
        this.uploadedAt = Date.now();
        this.lastModified = Date.now();
        this.metadata = {};
        this.formats = new Map();
        this.tags = [];
        this.isPublic = false;
    }

    addFormat(format, url, dimensions = {}) {
        this.formats.set(format, {
            url,
            dimensions,
            createdAt: Date.now(),
        });
    }

    getFormat(format) {
        return this.formats.get(format);
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }

    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
    }

    setPublic(isPublic) {
        this.isPublic = isPublic;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            size: this.size,
            url: this.url,
            uploadedAt: this.uploadedAt,
            formats: Array.from(this.formats.entries()).map(([format, data]) => ({
                format,
                ...data,
            })),
            tags: this.tags,
            isPublic: this.isPublic,
        };
    }
}

/**
 * ImageOptimizer - Image processing and optimization
 */
const ImageOptimizer = {
    supportedFormats: ['webp', 'avif', 'jpeg', 'png'],
    defaultQualities: {
        webp: 80,
        avif: 75,
        jpeg: 85,
        png: null,
    },
    maxDimensions: {
        thumbnail: { width: 200, height: 200 },
        small: { width: 400, height: 400 },
        medium: { width: 800, height: 800 },
        large: { width: 1600, height: 1600 },
        original: { width: null, height: null },
    },

    canOptimize: (file) => {
        return file.type.startsWith('image/');
    },

    generateResponsiveVariants: async (file) => {
        if (!ImageOptimizer.canOptimize(file)) {
            return null;
        }

        const variants = {};

        for (const [sizeName, dimensions] of Object.entries(ImageOptimizer.maxDimensions)) {
            for (const format of ImageOptimizer.supportedFormats) {
                const variantKey = `${sizeName}_${format}`;
                const quality = ImageOptimizer.defaultQualities[format];

                variants[variantKey] = {
                    format,
                    size: sizeName,
                    dimensions,
                    quality,
                    estimatedSize: ImageOptimizer._estimateSize(file.size, quality),
                };
            }
        }

        return variants;
    },

    _estimateSize: (originalSize, quality) => {
        if (!quality) return originalSize;
        return Math.round(originalSize * (quality / 100));
    },

    getSrcSet: (mediaFile) => {
        const srcSet = [];

        for (const sizeName of Object.keys(ImageOptimizer.maxDimensions)) {
            const format = mediaFile.getFormat(sizeName);
            if (format) {
                const dimensions = format.dimensions;
                if (dimensions.width) {
                    srcSet.push(`${format.url} ${dimensions.width}w`);
                }
            }
        }

        return srcSet.join(', ');
    },

    getSizes: () => {
        return `
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            (max-width: 1280px) 33vw,
            25vw
        `.trim();
    },
};

/**
 * LazyLoader - Lazy loading for images and media
 */
const LazyLoader = {
    observer: null,
    loadedElements: new Set(),
    retryAttempts: new Map(),
    maxRetries: 3,

    init: () => {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01,
        };

        LazyLoader.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    LazyLoader._loadElement(entry.target);
                }
            }
        }, options);

        console.log('🖼️ Lazy loader initialized');
    },

    observe: (element) => {
        if (!LazyLoader.observer) {
            LazyLoader.init();
        }

        if (element.dataset.src || element.dataset.srcset) {
            LazyLoader.observer.observe(element);
        }
    },

    observeAll: (selector = '[data-src], [data-srcset]') => {
        document.querySelectorAll(selector).forEach(el => LazyLoader.observe(el));
    },

    _loadElement: async (element) => {
        const src = element.dataset.src;
        const srcset = element.dataset.srcset;
        const sizes = element.dataset.sizes;

        try {
            if (element.tagName === 'IMG') {
                if (src) element.src = src;
                if (srcset) element.srcset = srcset;
                if (sizes) element.sizes = sizes;
            } else if (element.tagName === 'SOURCE') {
                if (src) element.src = src;
                if (srcset) element.srcset = srcset;
            } else {
                element.style.backgroundImage = `url('${src}')`;
            }

            element.classList.add('lazy-loaded');
            LazyLoader.loadedElements.add(element);
            LazyLoader.observer.unobserve(element);

            element.addEventListener('load', () => {
                element.classList.add('lazy-complete');
            });
        } catch (error) {
            LazyLoader._handleLoadError(element, error);
        }
    },

    _handleLoadError: (element, error) => {
        const attempts = LazyLoader.retryAttempts.get(element) || 0;

        if (attempts < LazyLoader.maxRetries) {
            LazyLoader.retryAttempts.set(element, attempts + 1);
            setTimeout(() => LazyLoader._loadElement(element), 1000 * (attempts + 1));
        } else {
            element.classList.add('lazy-error');
            console.error('Failed to load lazy image:', error);
        }
    },

    unobserveAll: () => {
        for (const element of LazyLoader.loadedElements) {
            LazyLoader.observer.unobserve(element);
        }
    },

    getStats: () => ({
        loadedCount: LazyLoader.loadedElements.size,
        failedCount: Array.from(document.querySelectorAll('.lazy-error')).length,
    }),
};

/**
 * MediaGallery - Organized media collection management
 */
class MediaGallery {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.files = new Map();
        this.createdAt = Date.now();
        this.lastModified = Date.now();
        this.metadata = {};
        this.isPublic = false;
    }

    addFile(mediaFile) {
        this.files.set(mediaFile.id, mediaFile);
        this.lastModified = Date.now();
        return this;
    }

    removeFile(fileId) {
        this.files.delete(fileId);
        this.lastModified = Date.now();
        return this;
    }

    getFiles() {
        return Array.from(this.files.values());
    }

    getFilesByTag(tag) {
        return this.getFiles().filter(f => f.tags.includes(tag));
    }

    getFilesByType(type) {
        return this.getFiles().filter(f => f.type === type);
    }

    searchFiles(query) {
        const q = query.toLowerCase();
        return this.getFiles().filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.tags.some(t => t.toLowerCase().includes(q))
        );
    }

    getTotalSize() {
        return this.getFiles().reduce((sum, f) => sum + f.size, 0);
    }

    getFileCount() {
        return this.files.size;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            fileCount: this.getFileCount(),
            totalSize: this.getTotalSize(),
            createdAt: this.createdAt,
            isPublic: this.isPublic,
        };
    }
}

/**
 * MediaManager - Central media management system
 */
const MediaManager = {
    galleries: new Map(),
    files: new Map(),
    uploadQueue: [],
    processingTasks: new Map(),

    createGallery: (galleryId, name) => {
        const gallery = new MediaGallery(galleryId, name);
        MediaManager.galleries.set(galleryId, gallery);
        return gallery;
    },

    getGallery: (galleryId) => MediaManager.galleries.get(galleryId),

    addToGallery: (galleryId, mediaFile) => {
        const gallery = MediaManager.getGallery(galleryId);
        if (gallery) {
            gallery.addFile(mediaFile);
            MediaManager.files.set(mediaFile.id, mediaFile);
        }
    },

    removeFromGallery: (galleryId, fileId) => {
        const gallery = MediaManager.getGallery(galleryId);
        if (gallery) {
            gallery.removeFile(fileId);
        }
    },

    getFile: (fileId) => MediaManager.files.get(fileId),

    uploadFile: async (file, galleryId = null, options = {}) => {
        const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mediaFile = new MediaFile(id, file.name, file.type, file.size, file.url || URL.createObjectURL(file));

        const upload = {
            id,
            file: mediaFile,
            status: 'pending',
            progress: 0,
            startedAt: Date.now(),
        };

        MediaManager.uploadQueue.push(upload);

        if (galleryId) {
            MediaManager.addToGallery(galleryId, mediaFile);
        }

        return mediaFile;
    },

    processMedia: async (mediaFile, options = {}) => {
        const { generateFormats = true, optimize = true } = options;

        const task = {
            id: `process_${Date.now()}`,
            mediaFile,
            status: 'processing',
            progress: 0,
            startedAt: Date.now(),
        };

        MediaManager.processingTasks.set(task.id, task);

        if (optimize && mediaFile.type.startsWith('image/')) {
            const variants = await ImageOptimizer.generateResponsiveVariants(mediaFile);
            if (variants) {
                // Store variant information in mediaFile
                Object.entries(variants).forEach(([key, variant]) => {
                    mediaFile.addFormat(key, `/optimized/${key}`, variant.dimensions);
                });
            }
        }

        task.status = 'completed';
        task.progress = 100;
        return mediaFile;
    },

    getGalleries: () => Array.from(MediaManager.galleries.values()),

    getTotalStorageUsed: () => {
        return Array.from(MediaManager.files.values())
            .reduce((sum, f) => sum + f.size, 0);
    },

    getUploadQueue: () => MediaManager.uploadQueue,

    getProcessingTasks: () => Array.from(MediaManager.processingTasks.values()),

    getStats: () => ({
        galleries: MediaManager.galleries.size,
        files: MediaManager.files.size,
        storageUsed: MediaManager.getTotalStorageUsed(),
        queuedUploads: MediaManager.uploadQueue.length,
        processingTasks: MediaManager.processingTasks.size,
    }),

    deleteFile: (fileId) => {
        const file = MediaManager.files.get(fileId);
        if (file && file.url && file.url.startsWith('blob:')) {
            URL.revokeObjectURL(file.url);
        }
        MediaManager.files.delete(fileId);
    },

    deleteGallery: (galleryId) => {
        const gallery = MediaManager.galleries.get(galleryId);
        if (gallery) {
            for (const file of gallery.getFiles()) {
                MediaManager.deleteFile(file.id);
            }
        }
        MediaManager.galleries.delete(galleryId);
    },
};

/**
 * Image Responsive Helper - Generate responsive image HTML
 */
const ResponsiveImageHelper = {
    generateImg: (mediaFile, alt = '', classList = '') => {
        const img = document.createElement('img');
        img.alt = alt;
        if (classList) img.className = classList;

        const srcSet = ImageOptimizer.getSrcSet(mediaFile);
        const sizes = ImageOptimizer.getSizes();

        if (srcSet) {
            img.srcset = srcSet;
            img.sizes = sizes;
        }

        const largeFormat = mediaFile.getFormat('large');
        img.src = largeFormat ? largeFormat.url : mediaFile.url;

        return img;
    },

    generatePicture: (mediaFile, alt = '', classList = '') => {
        const picture = document.createElement('picture');
        if (classList) picture.className = classList;

        // Add WebP source
        const webpFormat = mediaFile.getFormat('medium_webp');
        if (webpFormat) {
            const source = document.createElement('source');
            source.srcset = webpFormat.url;
            source.type = 'image/webp';
            picture.appendChild(source);
        }

        // Add fallback img
        const img = document.createElement('img');
        img.alt = alt;
        const fallbackFormat = mediaFile.getFormat('large');
        img.src = fallbackFormat ? fallbackFormat.url : mediaFile.url;

        picture.appendChild(img);
        return picture;
    },
};

/**
 * Initialize media manager on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
    LazyLoader.observeAll();
    console.log('📸 Media Manager initialized');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MediaFile,
        ImageOptimizer,
        LazyLoader,
        MediaGallery,
        MediaManager,
        ResponsiveImageHelper,
    };
}

window.MediaFile = MediaFile;
window.ImageOptimizer = ImageOptimizer;
window.LazyLoader = LazyLoader;
window.MediaGallery = MediaGallery;
window.MediaManager = MediaManager;
window.ResponsiveImageHelper = ResponsiveImageHelper;

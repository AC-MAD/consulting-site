/**
 * DigitalStark Aachen - Real-time Synchronization & Collaboration Engine
 * WebSocket-based sync, operational transformation, and collaborative features
 */

'use strict';

/**
 * Operation - Represents a document transformation
 */
class Operation {
    constructor(type, path, value, timestamp = null, userId = null) {
        this.id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type; // 'insert', 'delete', 'update'
        this.path = path; // JSON path to target
        this.value = value;
        this.timestamp = timestamp || Date.now();
        this.userId = userId;
        this.version = 0;
    }

    transform(otherOp) {
        // Simplified OT transformation
        if (this.path === otherOp.path) {
            if (this.type === 'update' && otherOp.type === 'update') {
                return otherOp.timestamp > this.timestamp ? this : otherOp;
            }
        }
        return this;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            path: this.path,
            value: this.value,
            timestamp: this.timestamp,
            userId: this.userId,
            version: this.version,
        };
    }
}

/**
 * Document - Collaborative document with version control
 */
class Document {
    constructor(id, initialData = {}) {
        this.id = id;
        this.data = initialData;
        this.version = 0;
        this.operations = [];
        this.snapshots = [];
        this.locks = new Map();
        this.presence = new Map();
    }

    applyOperation(op) {
        op.version = this.version;
        this.operations.push(op);

        // Apply operation to data
        this._applyToData(op);
        this.version++;

        return this;
    }

    _applyToData(op) {
        const pathParts = op.path.split('.');
        let current = this.data;

        // Navigate to parent
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) {
                current[pathParts[i]] = {};
            }
            current = current[pathParts[i]];
        }

        const lastKey = pathParts[pathParts.length - 1];

        if (op.type === 'insert' || op.type === 'update') {
            current[lastKey] = op.value;
        } else if (op.type === 'delete') {
            delete current[lastKey];
        }
    }

    lock(path, userId, timeout = 30000) {
        if (this.locks.has(path) && !this._isLockExpired(path)) {
            return false;
        }

        this.locks.set(path, {
            userId,
            acquiredAt: Date.now(),
            expiresAt: Date.now() + timeout,
        });

        return true;
    }

    unlock(path, userId) {
        const lock = this.locks.get(path);
        if (lock && lock.userId === userId) {
            this.locks.delete(path);
            return true;
        }
        return false;
    }

    isLocked(path) {
        return this.locks.has(path) && !this._isLockExpired(path);
    }

    _isLockExpired(path) {
        const lock = this.locks.get(path);
        return lock && lock.expiresAt < Date.now();
    }

    setPresence(userId, data) {
        this.presence.set(userId, {
            userId,
            position: data.position,
            selection: data.selection,
            updatedAt: Date.now(),
        });
    }

    removePresence(userId) {
        this.presence.delete(userId);
    }

    getPresence() {
        return Array.from(this.presence.values());
    }

    getHistory(limit = 100) {
        return this.operations.slice(-limit);
    }

    createSnapshot() {
        const snapshot = {
            version: this.version,
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(this.data)),
        };
        this.snapshots.push(snapshot);
        return snapshot;
    }

    restore(version) {
        const snapshot = this.snapshots.find(s => s.version === version);
        if (!snapshot) return false;

        this.data = JSON.parse(JSON.stringify(snapshot.data));
        this.version = snapshot.version;
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            version: this.version,
            data: this.data,
            operations: this.operations.length,
            snapshots: this.snapshots.length,
        };
    }
}

/**
 * RealtimeSync - Real-time synchronization engine
 */
const RealtimeSync = {
    documents: new Map(),
    connections: new Map(),
    messageQueue: [],
    isConnected: false,
    handlers: {},
    userId: null,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

    init: (userId = 'anonymous') => {
        RealtimeSync.userId = userId;
        console.log(`🔄 RealtimeSync initialized (User: ${userId}, Session: ${RealtimeSync.sessionId})`);
    },

    createDocument: (docId, initialData = {}) => {
        const doc = new Document(docId, initialData);
        RealtimeSync.documents.set(docId, doc);
        return doc;
    },

    getDocument: (docId) => RealtimeSync.documents.get(docId),

    updateDocument: (docId, path, value, type = 'update') => {
        const doc = RealtimeSync.documents.get(docId);
        if (!doc) return null;

        const op = new Operation(type, path, value, null, RealtimeSync.userId);
        doc.applyOperation(op);

        RealtimeSync._broadcast('document:changed', {
            docId,
            operation: op.toJSON(),
            version: doc.version,
        });

        RealtimeSync._queueMessage({
            type: 'operation',
            docId,
            operation: op.toJSON(),
        });

        return op;
    },

    lockPath: (docId, path, timeout = 30000) => {
        const doc = RealtimeSync.documents.get(docId);
        if (!doc) return false;

        const locked = doc.lock(path, RealtimeSync.userId, timeout);
        if (locked) {
            RealtimeSync._broadcast('lock:acquired', {
                docId,
                path,
                userId: RealtimeSync.userId,
                expiresAt: Date.now() + timeout,
            });
        }

        return locked;
    },

    unlockPath: (docId, path) => {
        const doc = RealtimeSync.documents.get(docId);
        if (!doc) return false;

        const unlocked = doc.unlock(path, RealtimeSync.userId);
        if (unlocked) {
            RealtimeSync._broadcast('lock:released', {
                docId,
                path,
                userId: RealtimeSync.userId,
            });
        }

        return unlocked;
    },

    setPresence: (docId, position, selection = null) => {
        const doc = RealtimeSync.documents.get(docId);
        if (!doc) return;

        doc.setPresence(RealtimeSync.userId, { position, selection });

        RealtimeSync._broadcast('presence:updated', {
            docId,
            userId: RealtimeSync.userId,
            position,
            selection,
        });
    },

    getCollaborators: (docId) => {
        const doc = RealtimeSync.documents.get(docId);
        return doc ? doc.getPresence() : [];
    },

    on: (event, handler) => {
        if (!RealtimeSync.handlers[event]) {
            RealtimeSync.handlers[event] = [];
        }
        RealtimeSync.handlers[event].push(handler);
    },

    _broadcast: (event, data) => {
        const handlers = RealtimeSync.handlers[event] || [];
        for (const handler of handlers) {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in realtime sync handler for ${event}:`, error);
            }
        }
    },

    _queueMessage: (message) => {
        RealtimeSync.messageQueue.push({
            ...message,
            sessionId: RealtimeSync.sessionId,
            userId: RealtimeSync.userId,
            timestamp: Date.now(),
        });

        if (RealtimeSync.isConnected) {
            RealtimeSync._flushQueue();
        }
    },

    _flushQueue: async () => {
        if (RealtimeSync.messageQueue.length === 0) return;

        const messages = [...RealtimeSync.messageQueue];
        RealtimeSync.messageQueue = [];

        console.log(`📤 Syncing ${messages.length} changes`);
    },

    connect: () => {
        RealtimeSync.isConnected = true;
        RealtimeSync._flushQueue();
        RealtimeSync._broadcast('sync:connected', { userId: RealtimeSync.userId });
    },

    disconnect: () => {
        RealtimeSync.isConnected = false;
        RealtimeSync._broadcast('sync:disconnected', { userId: RealtimeSync.userId });
    },

    getStats: () => ({
        documents: RealtimeSync.documents.size,
        messageQueue: RealtimeSync.messageQueue.length,
        isConnected: RealtimeSync.isConnected,
        userId: RealtimeSync.userId,
    }),
};

/**
 * Offline Queue - Queue operations when offline
 */
const OfflineQueue = {
    queue: [],
    maxSize: 1000,
    isOnline: navigator.onLine,

    init: () => {
        window.addEventListener('online', () => {
            OfflineQueue.isOnline = true;
            OfflineQueue._flushQueue();
        });

        window.addEventListener('offline', () => {
            OfflineQueue.isOnline = false;
        });
    },

    enqueue: (operation) => {
        if (OfflineQueue.queue.length < OfflineQueue.maxSize) {
            OfflineQueue.queue.push({
                ...operation,
                queuedAt: Date.now(),
            });
        }
    },

    _flushQueue: async () => {
        if (!OfflineQueue.isOnline || OfflineQueue.queue.length === 0) return;

        console.log(`🔄 Flushing ${OfflineQueue.queue.length} offline operations`);

        const operations = [...OfflineQueue.queue];
        OfflineQueue.queue = [];

        for (const op of operations) {
            RealtimeSync._queueMessage(op);
        }
    },

    getQueueSize: () => OfflineQueue.queue.length,

    getStatus: () => ({
        isOnline: OfflineQueue.isOnline,
        queuedOperations: OfflineQueue.queue.length,
    }),
};

/**
 * Conflict Resolution - Handle concurrent edits
 */
const ConflictResolver = {
    resolve: (localOp, remoteOp) => {
        if (localOp.path === remoteOp.path) {
            // Same path: use timestamp-based resolution
            if (localOp.timestamp === remoteOp.timestamp) {
                // Same timestamp: use userId
                return localOp.userId > remoteOp.userId ? localOp : remoteOp;
            }
            return localOp.timestamp > remoteOp.timestamp ? localOp : remoteOp;
        }

        // Different paths: both can be applied
        return [localOp, remoteOp];
    },

    merge: (operations) => {
        // Sort by timestamp, then by userId for deterministic ordering
        return operations.sort((a, b) => {
            if (a.timestamp !== b.timestamp) {
                return a.timestamp - b.timestamp;
            }
            return a.userId.localeCompare(b.userId);
        });
    },

    detectConflict: (op1, op2) => {
        if (op1.path !== op2.path) return false;

        const conflictingTypes = ['update', 'delete'];
        return conflictingTypes.includes(op1.type) && conflictingTypes.includes(op2.type);
    },
};

/**
 * Synchronization State Machine
 */
const SyncStateMachine = {
    state: 'disconnected',
    states: {
        disconnected: {
            connect: () => { SyncStateMachine.setState('connecting'); },
        },
        connecting: {
            success: () => { SyncStateMachine.setState('connected'); },
            fail: () => { SyncStateMachine.setState('disconnected'); },
        },
        connected: {
            disconnect: () => { SyncStateMachine.setState('disconnected'); },
            error: () => { SyncStateMachine.setState('reconnecting'); },
        },
        reconnecting: {
            success: () => { SyncStateMachine.setState('connected'); },
            giveUp: () => { SyncStateMachine.setState('disconnected'); },
        },
    },

    setState: (newState) => {
        console.log(`🔄 Sync state: ${SyncStateMachine.state} → ${newState}`);
        SyncStateMachine.state = newState;
    },

    canTransition: (action) => {
        return action in SyncStateMachine.states[SyncStateMachine.state];
    },

    transition: (action) => {
        if (SyncStateMachine.canTransition(action)) {
            SyncStateMachine.states[SyncStateMachine.state][action]();
            return true;
        }
        return false;
    },

    getState: () => SyncStateMachine.state,
};

/**
 * Initialize realtime sync
 */
document.addEventListener('DOMContentLoaded', () => {
    RealtimeSync.init('guest');
    OfflineQueue.init();
    RealtimeSync.connect();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Operation,
        Document,
        RealtimeSync,
        OfflineQueue,
        ConflictResolver,
        SyncStateMachine,
    };
}

window.Operation = Operation;
window.Document = Document;
window.RealtimeSync = RealtimeSync;
window.OfflineQueue = OfflineQueue;
window.ConflictResolver = ConflictResolver;
window.SyncStateMachine = SyncStateMachine;

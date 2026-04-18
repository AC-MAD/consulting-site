/**
 * DigitalStark Aachen - Advanced Audit Logging & Compliance System
 * Comprehensive audit trails, compliance tracking, and data governance
 */

'use strict';

/**
 * Audit Event - Immutable audit log entry
 */
class AuditEvent {
    constructor(action, actor, target, details = {}, metadata = {}) {
        this.id = this._generateId();
        this.timestamp = new Date().toISOString();
        this.action = action;
        this.actor = actor;
        this.target = target;
        this.details = Object.freeze({ ...details });
        this.metadata = {
            url: window.location.href,
            userAgent: navigator.userAgent,
            ip: null,
            sessionId: null,
            ...metadata,
        };
        this.status = 'success';
        this.severity = 'info';
    }

    _generateId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    setSeverity(severity) {
        const valid = ['info', 'warning', 'critical'];
        if (valid.includes(severity)) {
            this.severity = severity;
        }
        return this;
    }

    setStatus(status) {
        const valid = ['success', 'failure', 'partial'];
        if (valid.includes(status)) {
            this.status = status;
        }
        return this;
    }

    toJSON() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            action: this.action,
            actor: this.actor,
            target: this.target,
            details: this.details,
            metadata: this.metadata,
            status: this.status,
            severity: this.severity,
        };
    }
}

/**
 * Audit Logger - Central audit trail management
 */
const AuditLogger = {
    logs: [],
    maxLogs: 10000,
    handlers: [],
    rules: [],
    enabled: true,
    sessionId: null,

    init: (config = {}) => {
        const { maxLogs = 10000, enabled = true } = config;
        AuditLogger.maxLogs = maxLogs;
        AuditLogger.enabled = enabled;
        AuditLogger.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`📋 Audit Logger initialized (Session: ${AuditLogger.sessionId})`);
    },

    log: (action, actor, target, details = {}, metadata = {}) => {
        if (!AuditLogger.enabled) return null;

        const event = new AuditEvent(action, actor, target, details, {
            sessionId: AuditLogger.sessionId,
            ...metadata,
        });

        AuditLogger.logs.push(event);

        if (AuditLogger.logs.length > AuditLogger.maxLogs) {
            AuditLogger.logs.shift();
        }

        AuditLogger._applyRules(event);
        AuditLogger._notifyHandlers(event);

        console.log(`📝 Audit: ${action} on ${target} by ${actor}`);
        return event;
    },

    logPageAccess: (user, details = {}) => {
        return AuditLogger.log('PAGE_ACCESS', user, window.location.href, {
            title: document.title,
            ...details,
        });
    },

    logDataAccess: (user, resourceId, action, details = {}) => {
        return AuditLogger.log('DATA_ACCESS', user, resourceId, {
            action,
            ...details,
        });
    },

    logDataModification: (user, resourceId, changes = {}, details = {}) => {
        return AuditLogger.log('DATA_MODIFICATION', user, resourceId, {
            changes,
            ...details,
        }, { severity: 'warning' });
    },

    logDataDeletion: (user, resourceId, reason = '', details = {}) => {
        return AuditLogger.log('DATA_DELETION', user, resourceId, {
            reason,
            ...details,
        }, { severity: 'critical' });
    },

    logSecurityEvent: (eventType, details = {}) => {
        return AuditLogger.log('SECURITY_EVENT', 'SYSTEM', eventType, details, {
            severity: 'critical',
        });
    },

    logAuthenticationAttempt: (user, success, details = {}) => {
        const event = AuditLogger.log('AUTH_ATTEMPT', user, 'LOGIN', details);
        event.setStatus(success ? 'success' : 'failure');
        return event;
    },

    logConsentGiven: (user, consentType, timestamp = null, details = {}) => {
        return AuditLogger.log('CONSENT_GIVEN', user, consentType, {
            timestamp: timestamp || Date.now(),
            ...details,
        });
    },

    logConsentWithdrawn: (user, consentType, reason = '', details = {}) => {
        return AuditLogger.log('CONSENT_WITHDRAWN', user, consentType, {
            reason,
            ...details,
        });
    },

    addRule: (rule) => {
        AuditLogger.rules.push(rule);
    },

    addHandler: (handler) => {
        AuditLogger.handlers.push(handler);
    },

    _applyRules: (event) => {
        for (const rule of AuditLogger.rules) {
            try {
                rule(event);
            } catch (error) {
                console.error('Error applying audit rule:', error);
            }
        }
    },

    _notifyHandlers: (event) => {
        for (const handler of AuditLogger.handlers) {
            try {
                handler(event);
            } catch (error) {
                console.error('Error in audit handler:', error);
            }
        }
    },

    query: (filters = {}) => {
        const {
            action = null,
            actor = null,
            severity = null,
            startTime = null,
            endTime = null,
            limit = 100,
        } = filters;

        let results = [...AuditLogger.logs];

        if (action) results = results.filter(e => e.action === action);
        if (actor) results = results.filter(e => e.actor === actor);
        if (severity) results = results.filter(e => e.severity === severity);

        if (startTime) {
            const start = new Date(startTime).getTime();
            results = results.filter(e => new Date(e.timestamp).getTime() >= start);
        }

        if (endTime) {
            const end = new Date(endTime).getTime();
            results = results.filter(e => new Date(e.timestamp).getTime() <= end);
        }

        return results.slice(-limit);
    },

    export: (format = 'json') => {
        if (format === 'json') {
            return JSON.stringify(AuditLogger.logs, null, 2);
        } else if (format === 'csv') {
            return AuditLogger._toCSV(AuditLogger.logs);
        }
        return '';
    },

    _toCSV: (events) => {
        const headers = ['ID', 'Timestamp', 'Action', 'Actor', 'Target', 'Status', 'Severity'];
        const rows = events.map(e => [
            e.id,
            e.timestamp,
            e.action,
            e.actor,
            e.target,
            e.status,
            e.severity,
        ]);
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    },

    clear: () => {
        AuditLogger.logs = [];
    },

    getStats: () => {
        return {
            totalEvents: AuditLogger.logs.length,
            eventsByAction: AuditLogger._groupBy('action'),
            eventsBySeverity: AuditLogger._groupBy('severity'),
            eventsByStatus: AuditLogger._groupBy('status'),
        };
    },

    _groupBy: (field) => {
        const groups = {};
        for (const event of AuditLogger.logs) {
            const value = event[field];
            groups[value] = (groups[value] || 0) + 1;
        }
        return groups;
    },
};

/**
 * Data Governance - GDPR & data privacy compliance
 */
const DataGovernance = {
    consents: new Map(),
    dataSubjects: new Map(),
    retentionPolicies: new Map(),

    registerConsent: (userId, type, given, expiresAt = null) => {
        const consent = {
            userId,
            type,
            given,
            grantedAt: Date.now(),
            expiresAt,
        };

        if (!DataGovernance.consents.has(userId)) {
            DataGovernance.consents.set(userId, []);
        }

        DataGovernance.consents.get(userId).push(consent);

        if (given) {
            AuditLogger.logConsentGiven(userId, type, Date.now());
        } else {
            AuditLogger.logConsentWithdrawn(userId, type);
        }

        return consent;
    },

    hasConsent: (userId, type) => {
        const consents = DataGovernance.consents.get(userId) || [];
        const activeConsents = consents.filter(c => !c.expiresAt || c.expiresAt > Date.now());
        return activeConsents.some(c => c.type === type && c.given);
    },

    registerDataSubject: (userId, metadata = {}) => {
        const subject = {
            userId,
            createdAt: Date.now(),
            metadata,
            dataCategories: [],
        };

        DataGovernance.dataSubjects.set(userId, subject);
        return subject;
    },

    recordDataCategory: (userId, category, retained = true) => {
        const subject = DataGovernance.dataSubjects.get(userId);
        if (subject && !subject.dataCategories.includes(category)) {
            subject.dataCategories.push(category);
        }
    },

    setRetentionPolicy: (category, retentionDays) => {
        DataGovernance.retentionPolicies.set(category, {
            days: retentionDays,
            createdAt: Date.now(),
        });
    },

    getDataSubjectInfo: (userId) => {
        return DataGovernance.dataSubjects.get(userId) || null;
    },

    deleteDataSubject: (userId, reason = '') => {
        const subject = DataGovernance.dataSubjects.get(userId);
        if (subject) {
            AuditLogger.logDataDeletion('SYSTEM', userId, reason, {
                categories: subject.dataCategories,
            });
            DataGovernance.dataSubjects.delete(userId);
            DataGovernance.consents.delete(userId);
        }
    },

    checkRetentionCompliance: () => {
        const now = Date.now();
        const violations = [];

        for (const [userId, subject] of DataGovernance.dataSubjects.entries()) {
            for (const category of subject.dataCategories) {
                const policy = DataGovernance.retentionPolicies.get(category);
                if (policy) {
                    const retentionMs = policy.days * 24 * 60 * 60 * 1000;
                    const createdMs = subject.createdAt;
                    if (now - createdMs > retentionMs) {
                        violations.push({
                            userId,
                            category,
                            reason: 'Retention period exceeded',
                        });
                    }
                }
            }
        }

        return violations;
    },
};

/**
 * Change Tracking - Track data changes for compliance
 */
const ChangeTracking = {
    changeLog: [],
    watchers: new Map(),

    watch: (resourceId, callback) => {
        if (!ChangeTracking.watchers.has(resourceId)) {
            ChangeTracking.watchers.set(resourceId, []);
        }
        ChangeTracking.watchers.get(resourceId).push(callback);
    },

    recordChange: (resourceId, actor, oldValue, newValue, reason = '') => {
        const change = {
            id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            resourceId,
            actor,
            oldValue,
            newValue,
            reason,
        };

        ChangeTracking.changeLog.push(change);

        const callbacks = ChangeTracking.watchers.get(resourceId) || [];
        for (const callback of callbacks) {
            callback(change);
        }

        AuditLogger.logDataModification(actor, resourceId, { oldValue, newValue }, { reason });
        return change;
    },

    getHistory: (resourceId, limit = 100) => {
        return ChangeTracking.changeLog
            .filter(c => c.resourceId === resourceId)
            .slice(-limit)
            .reverse();
    },

    getChangesByActor: (actor, limit = 100) => {
        return ChangeTracking.changeLog
            .filter(c => c.actor === actor)
            .slice(-limit)
            .reverse();
    },

    clearHistory: (resourceId = null) => {
        if (resourceId) {
            ChangeTracking.changeLog = ChangeTracking.changeLog.filter(c => c.resourceId !== resourceId);
        } else {
            ChangeTracking.changeLog = [];
        }
    },
};

/**
 * Compliance Reporter - Generate compliance reports
 */
const ComplianceReporter = {
    generateAuditReport: (startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        const events = AuditLogger.logs.filter(e => {
            const time = new Date(e.timestamp).getTime();
            return time >= start && time <= end;
        });

        return {
            period: { start: startDate, end: endDate },
            totalEvents: events.length,
            eventsByAction: AuditLogger._groupBy('action'),
            criticalEvents: events.filter(e => e.severity === 'critical'),
            failedAttempts: events.filter(e => e.status === 'failure'),
            summary: ComplianceReporter._generateSummary(events),
        };
    },

    generateDataInventory: () => {
        return {
            totalSubjects: DataGovernance.dataSubjects.size,
            subjects: Array.from(DataGovernance.dataSubjects.values()),
            policies: Array.from(DataGovernance.retentionPolicies.entries()).map(([cat, policy]) => ({
                category: cat,
                ...policy,
            })),
        };
    },

    generateComplianceStatus: () => {
        const violations = DataGovernance.checkRetentionCompliance();

        return {
            compliant: violations.length === 0,
            violations,
            dataInventory: ComplianceReporter.generateDataInventory(),
            auditLog: {
                total: AuditLogger.logs.length,
                critical: AuditLogger.logs.filter(e => e.severity === 'critical').length,
            },
        };
    },

    _generateSummary: (events) => {
        return {
            dataAccess: events.filter(e => e.action === 'DATA_ACCESS').length,
            dataModification: events.filter(e => e.action === 'DATA_MODIFICATION').length,
            dataDeletion: events.filter(e => e.action === 'DATA_DELETION').length,
            securityEvents: events.filter(e => e.action === 'SECURITY_EVENT').length,
        };
    },
};

/**
 * Initialize audit logging on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    AuditLogger.init();
    AuditLogger.logPageAccess('visitor', { title: document.title });

    // Log form submissions
    document.addEventListener('submit', (e) => {
        AuditLogger.log('FORM_SUBMISSION', 'visitor', e.target.name || 'form');
    });

    // Log navigation
    window.addEventListener('beforeunload', () => {
        AuditLogger.logPageAccess('visitor', { action: 'PAGE_UNLOAD' });
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuditEvent,
        AuditLogger,
        DataGovernance,
        ChangeTracking,
        ComplianceReporter,
    };
}

window.AuditEvent = AuditEvent;
window.AuditLogger = AuditLogger;
window.DataGovernance = DataGovernance;
window.ChangeTracking = ChangeTracking;
window.ComplianceReporter = ComplianceReporter;

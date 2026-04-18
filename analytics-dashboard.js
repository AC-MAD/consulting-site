/**
 * DigitalStark Aachen - Advanced Analytics Dashboard & Reporting
 * Real-time metrics, advanced reporting, and data visualization
 */

'use strict';

/**
 * Metric - Individual performance metric
 */
class Metric {
    constructor(name, value = 0, unit = '', metadata = {}) {
        this.name = name;
        this.value = value;
        this.unit = unit;
        this.timestamp = Date.now();
        this.metadata = metadata;
        this.history = [{ value, timestamp: this.timestamp }];
        this.maxHistorySize = 1000;
    }

    update(value) {
        this.value = value;
        this.timestamp = Date.now();
        this.history.push({ value, timestamp: this.timestamp });

        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    getChange() {
        if (this.history.length < 2) return 0;
        const prev = this.history[this.history.length - 2].value;
        const current = this.value;
        return current - prev;
    }

    getPercentChange() {
        const change = this.getChange();
        if (this.history.length < 2) return 0;
        const prev = this.history[this.history.length - 2].value;
        return prev === 0 ? 0 : (change / prev) * 100;
    }

    getAverage(limit = 10) {
        const recent = this.history.slice(-limit);
        const sum = recent.reduce((acc, h) => acc + h.value, 0);
        return sum / recent.length;
    }

    getMin(limit = null) {
        const data = limit ? this.history.slice(-limit) : this.history;
        return Math.min(...data.map(h => h.value));
    }

    getMax(limit = null) {
        const data = limit ? this.history.slice(-limit) : this.history;
        return Math.max(...data.map(h => h.value));
    }

    toJSON() {
        return {
            name: this.name,
            value: this.value,
            unit: this.unit,
            timestamp: this.timestamp,
            change: this.getChange(),
            percentChange: this.getPercentChange().toFixed(2),
            average: this.getAverage().toFixed(2),
            min: this.getMin(),
            max: this.getMax(),
        };
    }
}

/**
 * MetricGroup - Collection of related metrics
 */
class MetricGroup {
    constructor(name) {
        this.name = name;
        this.metrics = new Map();
        this.createdAt = Date.now();
    }

    addMetric(name, value = 0, unit = '') {
        const metric = new Metric(name, value, unit);
        this.metrics.set(name, metric);
        return metric;
    }

    getMetric(name) {
        return this.metrics.get(name);
    }

    updateMetric(name, value) {
        const metric = this.getMetric(name);
        if (metric) {
            metric.update(value);
        }
    }

    getMetrics() {
        return Array.from(this.metrics.values());
    }

    toJSON() {
        return {
            name: this.name,
            metrics: this.getMetrics().map(m => m.toJSON()),
            createdAt: this.createdAt,
        };
    }
}

/**
 * Report - Aggregated data report
 */
class Report {
    constructor(id, title, startDate, endDate) {
        this.id = id;
        this.title = title;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.generatedAt = Date.now();
        this.sections = [];
        this.metadata = {};
    }

    addSection(name, content) {
        this.sections.push({
            name,
            content,
            timestamp: Date.now(),
        });
        return this;
    }

    addMetrics(metricGroup) {
        return this.addSection('Metrics', metricGroup.toJSON());
    }

    addChart(title, type, data) {
        return this.addSection(title, {
            type,
            data,
            timestamp: Date.now(),
        });
    }

    generate() {
        return {
            id: this.id,
            title: this.title,
            period: {
                start: this.startDate.toISOString(),
                end: this.endDate.toISOString(),
            },
            generatedAt: new Date(this.generatedAt).toISOString(),
            sections: this.sections,
        };
    }

    toJSON() {
        return this.generate();
    }

    export(format = 'json') {
        const data = this.generate();

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return AnalyticsDashboard._toCSV(data);
        }

        return null;
    }
}

/**
 * KPI - Key Performance Indicator
 */
class KPI {
    constructor(name, targetValue, currentValue = 0) {
        this.name = name;
        this.targetValue = targetValue;
        this.currentValue = currentValue;
        this.history = [];
        this.status = this._evaluateStatus();
    }

    update(value) {
        this.currentValue = value;
        this.history.push({
            value,
            timestamp: Date.now(),
        });
        this.status = this._evaluateStatus();
    }

    getProgress() {
        return (this.currentValue / this.targetValue) * 100;
    }

    _evaluateStatus() {
        const progress = this.getProgress();
        if (progress >= 100) return 'achieved';
        if (progress >= 75) return 'on_track';
        if (progress >= 50) return 'at_risk';
        return 'behind';
    }

    getTrend() {
        if (this.history.length < 2) return 'stable';

        const recent = this.history.slice(-5);
        const avgRecent = recent.reduce((sum, h) => sum + h.value, 0) / recent.length;
        const avgPrevious = this.history.slice(0, Math.max(5, this.history.length - 5))
            .reduce((sum, h) => sum + h.value, 0) / Math.min(5, this.history.length - 5);

        if (avgRecent > avgPrevious * 1.05) return 'increasing';
        if (avgRecent < avgPrevious * 0.95) return 'decreasing';
        return 'stable';
    }

    toJSON() {
        return {
            name: this.name,
            targetValue: this.targetValue,
            currentValue: this.currentValue,
            progress: this.getProgress().toFixed(2),
            status: this.status,
            trend: this.getTrend(),
        };
    }
}

/**
 * AnalyticsDashboard - Central analytics and reporting hub
 */
const AnalyticsDashboard = {
    metricGroups: new Map(),
    kpis: new Map(),
    reports: new Map(),
    timeSeries: new Map(),
    alerts: [],
    alertHandlers: [],

    createMetricGroup: (name) => {
        const group = new MetricGroup(name);
        AnalyticsDashboard.metricGroups.set(name, group);
        return group;
    },

    getMetricGroup: (name) => AnalyticsDashboard.metricGroups.get(name),

    addMetric: (groupName, metricName, value = 0, unit = '') => {
        let group = AnalyticsDashboard.getMetricGroup(groupName);
        if (!group) {
            group = AnalyticsDashboard.createMetricGroup(groupName);
        }
        return group.addMetric(metricName, value, unit);
    },

    updateMetric: (groupName, metricName, value) => {
        const group = AnalyticsDashboard.getMetricGroup(groupName);
        if (group) {
            group.updateMetric(metricName, value);
        }
    },

    createKPI: (name, target, current = 0) => {
        const kpi = new KPI(name, target, current);
        AnalyticsDashboard.kpis.set(name, kpi);
        return kpi;
    },

    getKPI: (name) => AnalyticsDashboard.kpis.get(name),

    updateKPI: (name, value) => {
        const kpi = AnalyticsDashboard.getKPI(name);
        if (kpi) {
            kpi.update(value);
        }
    },

    createReport: (title, startDate, endDate) => {
        const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const report = new Report(id, title, startDate, endDate);
        AnalyticsDashboard.reports.set(id, report);
        return report;
    },

    getReport: (id) => AnalyticsDashboard.reports.get(id),

    getReports: () => Array.from(AnalyticsDashboard.reports.values()),

    recordTimeSeries: (name, value, timestamp = null) => {
        if (!AnalyticsDashboard.timeSeries.has(name)) {
            AnalyticsDashboard.timeSeries.set(name, []);
        }

        AnalyticsDashboard.timeSeries.get(name).push({
            value,
            timestamp: timestamp || Date.now(),
        });
    },

    getTimeSeries: (name, limit = null) => {
        const series = AnalyticsDashboard.timeSeries.get(name) || [];
        return limit ? series.slice(-limit) : series;
    },

    addAlert: (level, message, metadata = {}) => {
        const alert = {
            id: `alert_${Date.now()}`,
            level,
            message,
            timestamp: Date.now(),
            metadata,
            acknowledged: false,
        };

        AnalyticsDashboard.alerts.push(alert);

        if (AnalyticsDashboard.alerts.length > 1000) {
            AnalyticsDashboard.alerts.shift();
        }

        AnalyticsDashboard._notifyAlertHandlers(alert);
        return alert;
    },

    onAlert: (handler) => {
        AnalyticsDashboard.alertHandlers.push(handler);
    },

    _notifyAlertHandlers: (alert) => {
        for (const handler of AnalyticsDashboard.alertHandlers) {
            try {
                handler(alert);
            } catch (error) {
                console.error('Error in alert handler:', error);
            }
        }
    },

    acknowledgeAlert: (alertId) => {
        const alert = AnalyticsDashboard.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
        }
    },

    getAlerts: (acknowledged = null) => {
        return AnalyticsDashboard.alerts.filter(a =>
            acknowledged === null || a.acknowledged === acknowledged
        );
    },

    getDashboard: () => ({
        metricGroups: Array.from(AnalyticsDashboard.metricGroups.values()).map(g => g.toJSON()),
        kpis: Array.from(AnalyticsDashboard.kpis.values()).map(k => k.toJSON()),
        alerts: AnalyticsDashboard.getAlerts(false),
        reportCount: AnalyticsDashboard.reports.size,
    }),

    generateQuickReport: (startDate, endDate) => {
        const report = AnalyticsDashboard.createReport('Quick Report', startDate, endDate);

        for (const [groupName, group] of AnalyticsDashboard.metricGroups.entries()) {
            report.addMetrics(group);
        }

        return report;
    },

    _toCSV: (report) => {
        let csv = `Report: ${report.title}\n`;
        csv += `Period: ${report.period.start} to ${report.period.end}\n\n`;

        for (const section of report.sections) {
            csv += `\n${section.name}\n`;
            if (Array.isArray(section.content)) {
                csv += section.content.map(item => Object.values(item).join(',')).join('\n');
            } else if (typeof section.content === 'object') {
                csv += Object.keys(section.content).join(',') + '\n';
                csv += Object.values(section.content).join(',');
            }
        }

        return csv;
    },

    exportDashboard: (format = 'json') => {
        const dashboard = AnalyticsDashboard.getDashboard();

        if (format === 'json') {
            return JSON.stringify(dashboard, null, 2);
        } else if (format === 'csv') {
            return AnalyticsDashboard._toCSV({ title: 'Dashboard Export', period: {}, sections: [{ name: 'Overview', content: dashboard }] });
        }

        return null;
    },

    clearOldData: (daysToKeep = 30) => {
        const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

        for (const [name, series] of AnalyticsDashboard.timeSeries.entries()) {
            AnalyticsDashboard.timeSeries.set(name, series.filter(s => s.timestamp > cutoff));
        }

        AnalyticsDashboard.alerts = AnalyticsDashboard.alerts.filter(a => a.timestamp > cutoff);
    },

    getStats: () => ({
        metricGroups: AnalyticsDashboard.metricGroups.size,
        metrics: Array.from(AnalyticsDashboard.metricGroups.values())
            .reduce((sum, g) => sum + g.metrics.size, 0),
        kpis: AnalyticsDashboard.kpis.size,
        reports: AnalyticsDashboard.reports.size,
        timeSeries: AnalyticsDashboard.timeSeries.size,
        alerts: AnalyticsDashboard.alerts.length,
    }),
};

/**
 * Real-time Monitoring - Monitor metrics and trigger alerts
 */
const RealtimeMonitoring = {
    rules: [],
    monitoringInterval: null,
    enabled: false,

    addRule: (name, condition, action) => {
        RealtimeMonitoring.rules.push({
            name,
            condition,
            action,
            lastTriggered: null,
        });
    },

    start: (intervalMs = 5000) => {
        if (RealtimeMonitoring.enabled) return;

        RealtimeMonitoring.enabled = true;
        RealtimeMonitoring.monitoringInterval = setInterval(() => {
            RealtimeMonitoring._checkRules();
        }, intervalMs);

        console.log('📊 Real-time monitoring started');
    },

    stop: () => {
        if (RealtimeMonitoring.monitoringInterval) {
            clearInterval(RealtimeMonitoring.monitoringInterval);
        }
        RealtimeMonitoring.enabled = false;
        console.log('📊 Real-time monitoring stopped');
    },

    _checkRules: () => {
        for (const rule of RealtimeMonitoring.rules) {
            try {
                if (rule.condition()) {
                    rule.action();
                    rule.lastTriggered = Date.now();
                }
            } catch (error) {
                console.error(`Error checking monitoring rule ${rule.name}:`, error);
            }
        }
    },

    getRules: () => RealtimeMonitoring.rules,
};

/**
 * Initialize analytics dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Analytics Dashboard initialized');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Metric,
        MetricGroup,
        Report,
        KPI,
        AnalyticsDashboard,
        RealtimeMonitoring,
    };
}

window.Metric = Metric;
window.MetricGroup = MetricGroup;
window.Report = Report;
window.KPI = KPI;
window.AnalyticsDashboard = AnalyticsDashboard;
window.RealtimeMonitoring = RealtimeMonitoring;

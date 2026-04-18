/**
 * DigitalStark Aachen - Data Visualization Module
 * Charts, graphs, and visual data representations
 */

'use strict';

/**
 * Chart Utilities - Canvas-based chart generation
 */
const ChartUtils = {
    /**
     * Create simple bar chart
     */
    createBarChart: (canvasElement, data, options = {}) => {
        const {
            colors = ['#42a5f5', '#4caf50'],
            width = canvasElement.width || 800,
            height = canvasElement.height || 400,
            barGap = 10,
            padding = 50,
        } = options;

        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Find max value
        const maxValue = Math.max(...data.values);

        // Calculate bar width
        const barWidth = (chartWidth - (data.values.length - 1) * barGap) / data.values.length;

        // Draw bars
        data.values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barGap);
            const y = height - padding - barHeight;

            // Bar background
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, barWidth, barHeight);

            // Value label
            ctx.fillStyle = '#212121';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 10);

            // X-axis label
            ctx.fillText(data.labels?.[index] || `Item ${index + 1}`, x + barWidth / 2, height - padding + 20);
        });

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
    },

    /**
     * Create line chart
     */
    createLineChart: (canvasElement, data, options = {}) => {
        const {
            lineColor = '#42a5f5',
            lineWidth = 2,
            pointRadius = 4,
            width = canvasElement.width || 800,
            height = canvasElement.height || 400,
            padding = 50,
        } = options;

        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Find min/max values
        const maxValue = Math.max(...data.values);
        const minValue = Math.min(...data.values);
        const range = maxValue - minValue || 1;

        // Calculate points
        const points = data.values.map((value, index) => {
            const x = padding + (index / (data.values.length - 1)) * chartWidth;
            const y = height - padding - ((value - minValue) / range) * chartHeight;
            return { x, y, value };
        });

        // Draw line
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();

        // Draw points
        points.forEach((point, index) => {
            ctx.fillStyle = lineColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
            ctx.fill();

            // Value label
            ctx.fillStyle = '#212121';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(point.value, point.x, point.y - 20);
        });

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
    },

    /**
     * Create pie chart
     */
    createPieChart: (canvasElement, data, options = {}) => {
        const {
            colors = ['#42a5f5', '#4caf50', '#2e7d32', '#0ea5e9'],
            width = canvasElement.width || 400,
            height = canvasElement.height || 400,
        } = options;

        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        // Calculate total
        const total = data.values.reduce((sum, val) => sum + val, 0);

        // Draw slices
        let startAngle = 0;

        data.values.forEach((value, index) => {
            const sliceAngle = (value / total) * Math.PI * 2;

            // Draw slice
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // Draw border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            const labelAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const percentage = ((value / total) * 100).toFixed(1);
            ctx.fillText(`${percentage}%`, labelX, labelY);

            startAngle += sliceAngle;
        });

        // Draw legend
        const legendX = width - 150;
        let legendY = 20;

        data.labels?.forEach((label, index) => {
            // Color box
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(legendX, legendY, 12, 12);

            // Label text
            ctx.fillStyle = '#212121';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(label, legendX + 20, legendY + 10);

            legendY += 25;
        });
    },

    /**
     * Create progress ring (circular progress)
     */
    createProgressRing: (canvasElement, percent, options = {}) => {
        const {
            color = '#42a5f5',
            backgroundColor = '#e0e0e0',
            lineWidth = 8,
            width = canvasElement.width || 200,
            height = canvasElement.height || 200,
        } = options;

        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = (Math.min(width, height) / 2) - (lineWidth / 2);

        // Background circle
        ctx.strokeStyle = backgroundColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Progress circle
        const angle = (percent / 100) * Math.PI * 2 - Math.PI / 2;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#212121';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(percent)}%`, centerX, centerY);
    },

    /**
     * Create sparkline (mini line chart)
     */
    createSparkline: (canvasElement, values, options = {}) => {
        const {
            color = '#42a5f5',
            width = canvasElement.width || 100,
            height = canvasElement.height || 20,
            lineWidth = 1,
        } = options;

        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue || 1;

        const points = values.map((value, index) => ({
            x: (index / (values.length - 1)) * width,
            y: height - ((value - minValue) / range) * height,
        }));

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();
    },
};

/**
 * Statistics - Calculate data statistics
 */
const Statistics = {
    /**
     * Calculate mean
     */
    mean: (values) => {
        return values.reduce((a, b) => a + b, 0) / values.length;
    },

    /**
     * Calculate median
     */
    median: (values) => {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    /**
     * Calculate standard deviation
     */
    stdDev: (values) => {
        const mean = Statistics.mean(values);
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = Statistics.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    },

    /**
     * Calculate min and max
     */
    range: (values) => {
        return {
            min: Math.min(...values),
            max: Math.max(...values),
            range: Math.max(...values) - Math.min(...values),
        };
    },

    /**
     * Calculate percentile
     */
    percentile: (values, p) => {
        const sorted = [...values].sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;

        if (lower === upper) {
            return sorted[lower];
        }

        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    },

    /**
     * Calculate correlation
     */
    correlation: (x, y) => {
        const n = x.length;
        const meanX = Statistics.mean(x);
        const meanY = Statistics.mean(y);

        let numerator = 0;
        let sumSqX = 0;
        let sumSqY = 0;

        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            numerator += dx * dy;
            sumSqX += dx * dx;
            sumSqY += dy * dy;
        }

        return numerator / Math.sqrt(sumSqX * sumSqY);
    },
};

/**
 * Data Formatting - Format values for display
 */
const DataFormatter = {
    /**
     * Format large numbers
     */
    number: (value, decimals = 0) => {
        return parseFloat(value).toFixed(decimals);
    },

    /**
     * Format as currency
     */
    currency: (value, currency = '€') => {
        return `${currency} ${Number(value).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
    },

    /**
     * Format as percentage
     */
    percentage: (value, decimals = 1) => {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    /**
     * Format as bytes
     */
    bytes: (bytes) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    },

    /**
     * Format time duration
     */
    duration: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    },
};

/**
 * Data Aggregation - Group and aggregate data
 */
const DataAggregation = {
    /**
     * Group by key
     */
    groupBy: (data, key) => {
        return data.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
            return groups;
        }, {});
    },

    /**
     * Sum by key
     */
    sumBy: (data, key) => {
        return data.reduce((sum, item) => sum + item[key], 0);
    },

    /**
     * Average by key
     */
    averageBy: (data, key) => {
        return DataAggregation.sumBy(data, key) / data.length;
    },

    /**
     * Count occurrences
     */
    count: (data, key, value) => {
        return data.filter(item => item[key] === value).length;
    },

    /**
     * Create frequency table
     */
    frequency: (data, key) => {
        const freq = {};
        data.forEach(item => {
            const val = item[key];
            freq[val] = (freq[val] || 0) + 1;
        });
        return freq;
    },

    /**
     * Pivot table
     */
    pivot: (data, rows, cols, values) => {
        const result = {};

        data.forEach(item => {
            const rowKey = item[rows];
            const colKey = item[cols];
            const value = item[values];

            if (!result[rowKey]) result[rowKey] = {};
            result[rowKey][colKey] = value;
        });

        return result;
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChartUtils,
        Statistics,
        DataFormatter,
        DataAggregation,
    };
}

// Make available globally
window.ChartUtils = ChartUtils;
window.Statistics = Statistics;
window.DataFormatter = DataFormatter;
window.DataAggregation = DataAggregation;

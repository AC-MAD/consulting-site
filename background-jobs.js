/**
 * DigitalStark Aachen - Advanced Background Jobs & Task Scheduling
 * Background task execution, scheduling, and job management
 */

'use strict';

/**
 * Job - Individual job/task unit
 */
class Job {
    constructor(id, name, fn, options = {}) {
        this.id = id;
        this.name = name;
        this.fn = fn;
        this.status = 'pending';
        this.createdAt = Date.now();
        this.startedAt = null;
        this.completedAt = null;
        this.duration = null;
        this.progress = 0;
        this.result = null;
        this.error = null;
        this.retries = 0;
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 30000;
        this.priority = options.priority || 'normal';
        this.tags = options.tags || [];
        this.metadata = options.metadata || {};
    }

    start() {
        this.status = 'running';
        this.startedAt = Date.now();
    }

    complete(result) {
        this.status = 'completed';
        this.result = result;
        this.completedAt = Date.now();
        this.duration = this.completedAt - this.startedAt;
    }

    fail(error) {
        this.status = this.retries < this.maxRetries ? 'retrying' : 'failed';
        this.error = error.message || String(error);
        this.completedAt = Date.now();
        this.duration = this.completedAt - this.startedAt;
        this.retries++;
    }

    setProgress(percent) {
        this.progress = Math.min(100, Math.max(0, percent));
    }

    getProgressInfo() {
        return {
            percent: this.progress,
            status: this.status,
            duration: this.duration,
            eta: this._estimateETA(),
        };
    }

    _estimateETA() {
        if (this.progress === 0) return null;
        const elapsed = Date.now() - this.startedAt;
        const rate = this.progress / elapsed;
        return (100 - this.progress) / rate;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            status: this.status,
            progress: this.progress,
            createdAt: this.createdAt,
            startedAt: this.startedAt,
            completedAt: this.completedAt,
            duration: this.duration,
            result: this.result,
            error: this.error,
            retries: this.retries,
        };
    }
}

/**
 * Job Queue - Manages job execution with priorities and scheduling
 */
class JobQueue {
    constructor(maxConcurrency = 3) {
        this.queue = [];
        this.running = new Set();
        this.completed = [];
        this.maxConcurrency = maxConcurrency;
        this.paused = false;
        this.handlers = {};
    }

    enqueue(name, fn, options = {}) {
        const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = new Job(id, name, fn, options);

        this.queue.push(job);
        this.queue.sort((a, b) => {
            const priorityMap = { high: 0, normal: 1, low: 2 };
            return priorityMap[a.priority] - priorityMap[b.priority];
        });

        this._tryRun();
        return id;
    }

    async _tryRun() {
        if (this.paused || this.running.size >= this.maxConcurrency) return;

        const job = this.queue.shift();
        if (!job) return;

        this.running.add(job);
        this._emit('jobStart', job);

        try {
            job.start();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Job timeout')), job.timeout)
            );

            const result = await Promise.race([job.fn(job), timeoutPromise]);
            job.complete(result);
            this.completed.push(job);

            this._emit('jobComplete', job);
        } catch (error) {
            job.fail(error);

            if (job.retries < job.maxRetries) {
                this.queue.unshift(job);
                this._emit('jobRetry', job);
            } else {
                this.completed.push(job);
                this._emit('jobFail', job);
            }
        } finally {
            this.running.delete(job);
            this._tryRun();
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
        for (let i = 0; i < this.maxConcurrency; i++) {
            this._tryRun();
        }
    }

    getJob(id) {
        const inQueue = this.queue.find(j => j.id === id);
        const inRunning = Array.from(this.running).find(j => j.id === id);
        const inCompleted = this.completed.find(j => j.id === id);

        return inQueue || inRunning || inCompleted || null;
    }

    getStatus() {
        return {
            queued: this.queue.length,
            running: this.running.size,
            completed: this.completed.length,
            paused: this.paused,
        };
    }

    on(event, handler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }

    _emit(event, ...args) {
        const handlers = this.handlers[event] || [];
        for (const handler of handlers) {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in job queue handler for ${event}:`, error);
            }
        }
    }

    clear() {
        this.queue = [];
        this.completed = [];
    }
}

/**
 * Job Scheduler - Cron-like job scheduling
 */
class JobScheduler {
    constructor(jobQueue) {
        this.jobQueue = jobQueue;
        this.scheduledJobs = new Map();
        this.timers = new Map();
    }

    scheduleInterval(name, fn, interval, options = {}) {
        const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = { id, name, fn, interval, type: 'interval', options };

        const execute = () => {
            this.jobQueue.enqueue(`${name} (scheduled)`, fn, options);
        };

        const timer = setInterval(execute, interval);
        this.timers.set(id, timer);
        this.scheduledJobs.set(id, job);

        execute();
        return id;
    }

    scheduleDelay(name, fn, delay, options = {}) {
        const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = { id, name, fn, delay, type: 'delay', options };

        const timer = setTimeout(() => {
            this.jobQueue.enqueue(`${name} (scheduled)`, fn, options);
            this.scheduledJobs.delete(id);
            this.timers.delete(id);
        }, delay);

        this.timers.set(id, timer);
        this.scheduledJobs.set(id, job);

        return id;
    }

    scheduleCron(name, fn, cronExpression, options = {}) {
        const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = { id, name, fn, cron: cronExpression, type: 'cron', options };

        const nextRun = this._calculateNextRun(cronExpression);
        const delay = nextRun - Date.now();

        const scheduleNext = () => {
            this.jobQueue.enqueue(`${name} (cron)`, fn, options);
            const next = this._calculateNextRun(cronExpression);
            const nextDelay = next - Date.now();
            this.timers.set(id, setTimeout(scheduleNext, nextDelay));
        };

        this.timers.set(id, setTimeout(scheduleNext, delay));
        this.scheduledJobs.set(id, job);

        return id;
    }

    cancelSchedule(id) {
        const timer = this.timers.get(id);
        if (timer) {
            clearInterval(timer);
            clearTimeout(timer);
            this.timers.delete(id);
        }
        this.scheduledJobs.delete(id);
    }

    _calculateNextRun(cronExpression) {
        const parts = cronExpression.split(' ');
        const [minute, hour, day, month, dayOfWeek] = parts.map(p => p === '*' ? null : parseInt(p));

        let next = new Date();
        next.setSeconds(0);
        next.setMilliseconds(0);
        next.setMinutes(next.getMinutes() + 1);

        if (minute !== null) next.setMinutes(minute);
        if (hour !== null) next.setHours(hour);
        if (day !== null) next.setDate(day);
        if (month !== null) next.setMonth(month - 1);

        return next.getTime();
    }

    getScheduledJobs() {
        return Array.from(this.scheduledJobs.values());
    }
}

/**
 * Job Batch - Process multiple jobs together
 */
class JobBatch {
    constructor(name, options = {}) {
        this.name = name;
        this.jobs = [];
        this.options = options;
        this.createdAt = Date.now();
        this.startedAt = null;
        this.completedAt = null;
        this.status = 'pending';
        this.results = [];
        this.errors = [];
    }

    addJob(name, fn, options = {}) {
        const job = new Job(`${this.name}_${this.jobs.length}`, name, fn, options);
        this.jobs.push(job);
        return this;
    }

    async execute() {
        this.status = 'running';
        this.startedAt = Date.now();

        const { parallel = false, stopOnError = false } = this.options;

        if (parallel) {
            return this._executeParallel(stopOnError);
        } else {
            return this._executeSequential(stopOnError);
        }
    }

    async _executeSequential(stopOnError) {
        for (const job of this.jobs) {
            try {
                job.start();
                const result = await job.fn(job);
                job.complete(result);
                this.results.push(result);
            } catch (error) {
                job.fail(error);
                this.errors.push(error);
                if (stopOnError) break;
            }
        }

        this._finalize();
        return { results: this.results, errors: this.errors };
    }

    async _executeParallel(stopOnError) {
        const promises = this.jobs.map(async (job) => {
            try {
                job.start();
                const result = await job.fn(job);
                job.complete(result);
                return { success: true, result };
            } catch (error) {
                job.fail(error);
                return { success: false, error };
            }
        });

        const settled = await Promise.allSettled(promises);

        for (const result of settled) {
            if (result.status === 'fulfilled') {
                if (result.value.success) {
                    this.results.push(result.value.result);
                } else {
                    this.errors.push(result.value.error);
                    if (stopOnError) break;
                }
            }
        }

        this._finalize();
        return { results: this.results, errors: this.errors };
    }

    _finalize() {
        this.completedAt = Date.now();
        this.status = this.errors.length === 0 ? 'completed' : 'failed';
    }

    getProgress() {
        const completed = this.jobs.filter(j => ['completed', 'failed'].includes(j.status)).length;
        return (completed / this.jobs.length) * 100;
    }
}

/**
 * Job Manager - Central job management system
 */
const JobManager = {
    queue: null,
    scheduler: null,
    batches: new Map(),

    init: (maxConcurrency = 3) => {
        JobManager.queue = new JobQueue(maxConcurrency);
        JobManager.scheduler = new JobScheduler(JobManager.queue);

        console.log('🎯 Job Manager initialized');
    },

    enqueue: (name, fn, options = {}) => {
        return JobManager.queue.enqueue(name, fn, options);
    },

    schedule: (name, fn, interval, options = {}) => {
        return JobManager.scheduler.scheduleInterval(name, fn, interval, options);
    },

    scheduleOnce: (name, fn, delay, options = {}) => {
        return JobManager.scheduler.scheduleDelay(name, fn, delay, options);
    },

    createBatch: (name, options = {}) => {
        const batch = new JobBatch(name, options);
        JobManager.batches.set(name, batch);
        return batch;
    },

    getJob: (id) => JobManager.queue.getJob(id),

    getQueueStatus: () => JobManager.queue.getStatus(),

    getScheduledJobs: () => JobManager.scheduler.getScheduledJobs(),

    pauseQueue: () => JobManager.queue.pause(),

    resumeQueue: () => JobManager.queue.resume(),

    clearQueue: () => JobManager.queue.clear(),

    onJobComplete: (handler) => JobManager.queue.on('jobComplete', handler),

    onJobFail: (handler) => JobManager.queue.on('jobFail', handler),

    onJobStart: (handler) => JobManager.queue.on('jobStart', handler),

    cancel: (id) => {
        const job = JobManager.queue.getJob(id);
        if (job && job.status === 'pending') {
            JobManager.queue.queue = JobManager.queue.queue.filter(j => j.id !== id);
        }
    },

    cancelSchedule: (id) => {
        JobManager.scheduler.cancelSchedule(id);
    },

    getStats: () => ({
        queue: JobManager.queue.getStatus(),
        completed: JobManager.queue.completed.length,
        scheduled: JobManager.scheduler.getScheduledJobs().length,
        batches: JobManager.batches.size,
    }),

    exportState: () => ({
        queued: JobManager.queue.queue.map(j => j.toJSON()),
        running: Array.from(JobManager.queue.running).map(j => j.toJSON()),
        completed: JobManager.queue.completed.slice(-100).map(j => j.toJSON()),
        scheduled: JobManager.scheduler.getScheduledJobs(),
    }),
};

/**
 * Initialize job manager on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    JobManager.init(3);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Job,
        JobQueue,
        JobScheduler,
        JobBatch,
        JobManager,
    };
}

window.Job = Job;
window.JobQueue = JobQueue;
window.JobScheduler = JobScheduler;
window.JobBatch = JobBatch;
window.JobManager = JobManager;

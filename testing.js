/**
 * DigitalStark Aachen - Testing Utilities
 * Unit testing, assertion, and test running framework
 */

'use strict';

/**
 * Test Runner - Simple test framework
 */
const TestRunner = {
    suites: [],
    results: [],
    currentSuite: null,
    isRunning: false,

    /**
     * Create test suite
     */
    describe: (name, fn) => {
        const suite = {
            name,
            tests: [],
            beforeEach: [],
            afterEach: [],
            beforeAll: [],
            afterAll: [],
        };

        TestRunner.currentSuite = suite;
        fn();
        TestRunner.currentSuite = null;

        TestRunner.suites.push(suite);
    },

    /**
     * Define test case
     */
    test: (name, fn) => {
        if (!TestRunner.currentSuite) {
            console.warn('Test must be defined inside describe()');
            return;
        }

        TestRunner.currentSuite.tests.push({ name, fn });
    },

    /**
     * Before each test
     */
    beforeEach: (fn) => {
        if (TestRunner.currentSuite) {
            TestRunner.currentSuite.beforeEach.push(fn);
        }
    },

    /**
     * After each test
     */
    afterEach: (fn) => {
        if (TestRunner.currentSuite) {
            TestRunner.currentSuite.afterEach.push(fn);
        }
    },

    /**
     * Before all tests
     */
    beforeAll: (fn) => {
        if (TestRunner.currentSuite) {
            TestRunner.currentSuite.beforeAll.push(fn);
        }
    },

    /**
     * After all tests
     */
    afterAll: (fn) => {
        if (TestRunner.currentSuite) {
            TestRunner.currentSuite.afterAll.push(fn);
        }
    },

    /**
     * Run all tests
     */
    run: async () => {
        TestRunner.isRunning = true;
        TestRunner.results = [];

        const startTime = performance.now();

        for (const suite of TestRunner.suites) {
            console.group(`🧪 ${suite.name}`);

            // Run beforeAll hooks
            for (const hook of suite.beforeAll) {
                try {
                    await hook();
                } catch (error) {
                    console.error('beforeAll error:', error);
                }
            }

            // Run tests
            for (const test of suite.tests) {
                // Run beforeEach hooks
                for (const hook of suite.beforeEach) {
                    try {
                        await hook();
                    } catch (error) {
                        console.error('beforeEach error:', error);
                    }
                }

                const result = {
                    suite: suite.name,
                    test: test.name,
                    passed: false,
                    error: null,
                };

                try {
                    await test.fn();
                    result.passed = true;
                    console.log(`  ✓ ${test.name}`);
                } catch (error) {
                    result.error = error.message;
                    console.error(`  ✗ ${test.name}`);
                    console.error(`    ${error.message}`);
                }

                // Run afterEach hooks
                for (const hook of suite.afterEach) {
                    try {
                        await hook();
                    } catch (error) {
                        console.error('afterEach error:', error);
                    }
                }

                TestRunner.results.push(result);
            }

            // Run afterAll hooks
            for (const hook of suite.afterAll) {
                try {
                    await hook();
                } catch (error) {
                    console.error('afterAll error:', error);
                }
            }

            console.groupEnd();
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        TestRunner._printSummary(duration);
        TestRunner.isRunning = false;
    },

    /**
     * Print test summary
     */
    _printSummary: (duration) => {
        const total = TestRunner.results.length;
        const passed = TestRunner.results.filter(r => r.passed).length;
        const failed = total - passed;

        console.log('\n' + '='.repeat(50));
        console.log(`✓ Passed: ${passed}/${total}`);
        console.log(`✗ Failed: ${failed}/${total}`);
        console.log(`⏱ Duration: ${duration}ms`);
        console.log('='.repeat(50));

        return { total, passed, failed };
    },

    /**
     * Get results
     */
    getResults: () => TestRunner.results,
};

/**
 * Assertions - Test assertion library
 */
const assert = {
    /**
     * Assert true
     */
    ok: (value, message = 'Expected value to be truthy') => {
        if (!value) throw new Error(message);
    },

    /**
     * Assert false
     */
    notOk: (value, message = 'Expected value to be falsy') => {
        if (value) throw new Error(message);
    },

    /**
     * Assert equality
     */
    equal: (actual, expected, message) => {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected} but got ${actual}`);
        }
    },

    /**
     * Assert not equal
     */
    notEqual: (actual, expected, message) => {
        if (actual === expected) {
            throw new Error(message || `Expected not ${expected} but got ${actual}`);
        }
    },

    /**
     * Assert deep equality (objects and arrays)
     */
    deepEqual: (actual, expected, message) => {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);

        if (actualStr !== expectedStr) {
            throw new Error(message || `Expected ${expectedStr} but got ${actualStr}`);
        }
    },

    /**
     * Assert deep not equal
     */
    notDeepEqual: (actual, expected, message) => {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);

        if (actualStr === expectedStr) {
            throw new Error(message || `Expected not ${expectedStr} but got ${actualStr}`);
        }
    },

    /**
     * Assert instance of
     */
    instanceOf: (object, constructor, message) => {
        if (!(object instanceof constructor)) {
            throw new Error(message || `Expected instance of ${constructor.name}`);
        }
    },

    /**
     * Assert type
     */
    typeOf: (value, type, message) => {
        if (typeof value !== type) {
            throw new Error(message || `Expected type ${type} but got ${typeof value}`);
        }
    },

    /**
     * Assert array includes
     */
    includes: (array, value, message) => {
        if (!array.includes(value)) {
            throw new Error(message || `Expected array to include ${value}`);
        }
    },

    /**
     * Assert array not includes
     */
    notIncludes: (array, value, message) => {
        if (array.includes(value)) {
            throw new Error(message || `Expected array not to include ${value}`);
        }
    },

    /**
     * Assert throws error
     */
    throws: (fn, message) => {
        try {
            fn();
            throw new Error(message || 'Expected function to throw');
        } catch (error) {
            if (error.message.includes('Expected function to throw')) {
                throw error;
            }
        }
    },

    /**
     * Assert does not throw
     */
    notThrows: (fn, message) => {
        try {
            fn();
        } catch (error) {
            throw new Error(message || `Expected function not to throw: ${error.message}`);
        }
    },

    /**
     * Assert string matches regex
     */
    match: (str, regex, message) => {
        if (!regex.test(str)) {
            throw new Error(message || `Expected "${str}" to match ${regex}`);
        }
    },

    /**
     * Assert object has property
     */
    hasProperty: (object, property, message) => {
        if (!(property in object)) {
            throw new Error(message || `Expected object to have property ${property}`);
        }
    },

    /**
     * Assert greater than
     */
    greaterThan: (actual, expected, message) => {
        if (actual <= expected) {
            throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
        }
    },

    /**
     * Assert less than
     */
    lessThan: (actual, expected, message) => {
        if (actual >= expected) {
            throw new Error(message || `Expected ${actual} to be less than ${expected}`);
        }
    },

    /**
     * Assert between
     */
    between: (value, min, max, message) => {
        if (value < min || value > max) {
            throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
        }
    },
};

/**
 * Mocking - Mock functions and objects
 */
const Mock = {
    /**
     * Create mock function
     */
    fn: (implementation = null) => {
        const calls = [];
        const returnValues = [];

        const mockFunction = function (...args) {
            calls.push(args);

            if (implementation) {
                return implementation(...args);
            }

            return returnValues[calls.length - 1];
        };

        mockFunction.calls = calls;
        mockFunction.callCount = () => calls.length;
        mockFunction.called = () => calls.length > 0;
        mockFunction.calledWith = (...args) => {
            return calls.some(call => JSON.stringify(call) === JSON.stringify(args));
        };
        mockFunction.lastCall = () => calls[calls.length - 1];
        mockFunction.returnValue = (value) => {
            returnValues.push(value);
            return mockFunction;
        };
        mockFunction.reset = () => {
            calls.length = 0;
            returnValues.length = 0;
        };

        return mockFunction;
    },

    /**
     * Create mock object
     */
    object: (spec = {}) => {
        const mock = {};

        for (const [key, value] of Object.entries(spec)) {
            if (typeof value === 'function') {
                mock[key] = Mock.fn(value);
            } else {
                mock[key] = value;
            }
        }

        return mock;
    },

    /**
     * Spy on method
     */
    spy: (object, method) => {
        const original = object[method];
        const calls = [];

        object[method] = function (...args) {
            calls.push(args);
            return original.apply(this, args);
        };

        object[method].calls = calls;
        object[method].restore = () => {
            object[method] = original;
        };

        return object[method];
    },
};

/**
 * Fixtures - Test data generators
 */
const Fixtures = {
    /**
     * Generate random string
     */
    randomString: (length = 10) => {
        return Math.random().toString(36).substr(2, length);
    },

    /**
     * Generate random number
     */
    randomNumber: (min = 0, max = 100) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Generate random email
     */
    randomEmail: () => {
        return `${Fixtures.randomString()}@example.com`;
    },

    /**
     * Generate random user
     */
    randomUser: () => {
        return {
            id: Fixtures.randomNumber(),
            name: Fixtures.randomString(),
            email: Fixtures.randomEmail(),
            created: new Date().toISOString(),
        };
    },

    /**
     * Generate multiple items
     */
    generateArray: (generator, count = 10) => {
        return Array.from({ length: count }, () => generator());
    },
};

/**
 * Performance Testing
 */
const Performance = {
    /**
     * Measure function execution time
     */
    measure: (fn, iterations = 1) => {
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            fn();
            const end = performance.now();
            times.push(end - start);
        }

        return {
            min: Math.min(...times),
            max: Math.max(...times),
            avg: times.reduce((a, b) => a + b, 0) / times.length,
            total: times.reduce((a, b) => a + b, 0),
            times,
        };
    },

    /**
     * Benchmark function
     */
    benchmark: (name, fn, options = {}) => {
        const { iterations = 1000, warmup = true } = options;

        if (warmup) {
            for (let i = 0; i < 100; i++) fn();
        }

        const result = Performance.measure(fn, iterations);

        console.log(`📊 ${name}`);
        console.log(`   Min: ${result.min.toFixed(2)}ms`);
        console.log(`   Max: ${result.max.toFixed(2)}ms`);
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
        console.log(`   Total: ${result.total.toFixed(2)}ms`);

        return result;
    },

    /**
     * Compare two functions
     */
    compare: (name1, fn1, name2, fn2, options = {}) => {
        const { iterations = 1000 } = options;

        const result1 = Performance.measure(fn1, iterations);
        const result2 = Performance.measure(fn2, iterations);

        const faster = result1.avg < result2.avg ? name1 : name2;
        const slowFactor = Math.max(result1.avg, result2.avg) / Math.min(result1.avg, result2.avg);

        console.log(`⚡ ${name1}: ${result1.avg.toFixed(2)}ms`);
        console.log(`⚡ ${name2}: ${result2.avg.toFixed(2)}ms`);
        console.log(`🏆 ${faster} is ${slowFactor.toFixed(2)}x faster`);

        return { result1, result2, faster, slowFactor };
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TestRunner,
        assert,
        Mock,
        Fixtures,
        Performance,
    };
}

// Make available globally
window.TestRunner = TestRunner;
window.assert = assert;
window.Mock = Mock;
window.Fixtures = Fixtures;
window.Performance = Performance;

// Shorthand for common test functions
window.describe = TestRunner.describe;
window.test = TestRunner.test;
window.beforeEach = TestRunner.beforeEach;
window.afterEach = TestRunner.afterEach;
window.beforeAll = TestRunner.beforeAll;
window.afterAll = TestRunner.afterAll;

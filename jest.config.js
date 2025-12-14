export default {
    testEnvironment: 'node',
    transform: {},
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapping: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    testMatch: [
        '**/src/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/tests/**',
        '!src/logs/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html']
};
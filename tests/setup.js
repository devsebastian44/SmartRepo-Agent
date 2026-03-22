// Jest setup file
process.env.NODE_ENV = 'test'

// Mock console methods to reduce noise in tests
const originalConsole = global.console

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
})

afterAll(() => {
  global.console = originalConsole
})

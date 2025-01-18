'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');
jest.mock('loopback');
jest.mock('loopback-boot');

// Create a mock app object with required methods
const mockApp = {
  listen: jest.fn(),
  emit: jest.fn(),
  get: jest.fn((key) => {
    if (key === 'url') return 'http://localhost:3000/';
    if (key === 'loopback-component-explorer') return { mountPath: '/explorer' };
  }),
};

loopback.mockImplementation(() => mockApp);

// Import the app after mocks are set
const app = require('../server/server');

describe('App Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    boot.mockReset(); // Reset any previous mock behavior
  });

  test('should emit "started" and log server info when started', () => {
    // Mock app.listen behavior
    mockApp.listen.mockImplementationOnce((callback) => {
      callback(); // Simulate server starting
    });

    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Start the app
    app.start();

    // Assertions
    expect(mockApp.emit).toHaveBeenCalledWith('started');
    expect(consoleLogSpy).toHaveBeenCalledWith('Web server listening at: %s', 'http://localhost:3000');
    expect(consoleLogSpy).toHaveBeenCalledWith('Browse your REST API at %s%s', 'http://localhost:3000', '/explorer');

    // Cleanup
    consoleLogSpy.mockRestore();
  });

  test('should throw error if boot fails', () => {
    const mockError = new Error('Boot failed');
  
    boot.mockImplementationOnce((_, __, callback) => {
      callback(mockError); // Simulate boot error
    });
  
    expect(() => {
      jest.isolateModules(() => {
        require('../server/server'); // Reload the module
      });
    }).toThrow('Boot failed');
  });

  test('should call boot with the app and dirname', () => {
    boot.mockImplementationOnce((appInstance, dir, callback) => {
      expect(appInstance).toBe(mockApp);
      expect(dir).toBe(path.resolve(__dirname, '../server'));
      callback();
    });
  
    jest.isolateModules(() => {
      require('../server/server'); // Reload the module to invoke boot
    });
  
    expect(boot).toHaveBeenCalledTimes(1);
  });

  test('should not call app.start if not the main module', () => {
    jest.isolateModules(() => {
      const mockStart = jest.fn();
      mockApp.start = mockStart;

      jest.mock('module', () => ({
        __esModule: true,
        default: { main: { id: 'other-module' } },
      }));

      require('../server/server'); // Reload the app

      expect(mockStart).not.toHaveBeenCalled();
    });
  });
});

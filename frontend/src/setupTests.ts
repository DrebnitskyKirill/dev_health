import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'granted',
    requestPermission: jest.fn().mockResolvedValue('granted'),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
// Mock fetch with default responses
global.fetch = jest.fn((url: string) => {
  // Default mock responses for different endpoints
  if (url.includes('/user-achievements')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        achievements: [],
        badges: [],
        healthScore: 100,
        level: 5,
        experience: 250
      })
    });
  }
  
  if (url.includes('/leaderboard')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        leaderboard: []
      })
    });
  }
  
  if (url.includes('/profile')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 1,
          email: 'test@test.com',
          username: 'testuser',
          healthScore: 100,
          level: 5,
          experience: 250,
          badges: ['first-badge', 'second-badge']
        }
      })
    });
  }
  
  if (url.includes('/change-password')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        message: 'Password changed successfully',
        user: {
          id: 1,
          email: 'test@test.com',
          username: 'testuser',
          healthScore: 100,
          level: 5,
          experience: 250,
          badges: ['first-badge', 'second-badge']
        }
      })
    });
  }
  
  // Default response for any other URL
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  });
});

// Mock WebGL
const getContext = jest.fn(() => ({
  getExtension: jest.fn(),
  getParameter: jest.fn(),
  createBuffer: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getAttribLocation: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn(),
}));

HTMLCanvasElement.prototype.getContext = getContext;

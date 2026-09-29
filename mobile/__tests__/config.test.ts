/**
 * The backend address must resolve to something a *phone* can reach, which
 * `localhost` never is. These cover each way the host is decided.
 */

/** Reload config.ts under a given expo-constants shape and env. */
function loadApi(constants: unknown, env: Record<string, string | undefined> = {}) {
  let api!: typeof import('@/config').API;
  jest.isolateModules(() => {
    jest.doMock('expo-constants', () => ({ __esModule: true, default: constants }));
    const previous = { ...process.env };
    Object.assign(process.env, env);
    api = (require('@/config') as typeof import('@/config')).API;
    process.env = previous;
  });
  return api;
}

afterEach(() => jest.resetModules());

describe('API base url', () => {
  it('derives the host from the machine serving the bundle', () => {
    // What Metro reports when a phone loads the app over the LAN.
    const api = loadApi({ expoConfig: { hostUri: '192.168.0.2:8081' } });
    expect(api.baseUrl).toBe('http://192.168.0.2:8000');
  });

  it('falls back to the Expo Go debugger host', () => {
    const api = loadApi({ expoConfig: null, expoGoConfig: { debuggerHost: '10.0.1.7:8081' } });
    expect(api.baseUrl).toBe('http://10.0.1.7:8000');
  });

  it('uses localhost only when no host is known', () => {
    expect(loadApi({ expoConfig: null }).baseUrl).toBe('http://localhost:8000');
  });

  it('lets an explicit override win over the detected host', () => {
    const api = loadApi(
      { expoConfig: { hostUri: '192.168.0.2:8081' } },
      { EXPO_PUBLIC_API_BASE_URL: 'https://armoi.example.com' },
    );
    expect(api.baseUrl).toBe('https://armoi.example.com');
  });

  it('trims a trailing slash from an override', () => {
    const api = loadApi(
      { expoConfig: null },
      { EXPO_PUBLIC_API_BASE_URL: 'https://armoi.example.com/' },
    );
    expect(api.baseUrl).toBe('https://armoi.example.com');
  });

  it('ignores a blank override rather than producing a bare port', () => {
    const api = loadApi(
      { expoConfig: { hostUri: '192.168.0.2:8081' } },
      { EXPO_PUBLIC_API_BASE_URL: '   ' },
    );
    expect(api.baseUrl).toBe('http://192.168.0.2:8000');
  });

  it('honours a custom backend port', () => {
    const api = loadApi(
      { expoConfig: { hostUri: '192.168.0.2:8081' } },
      { EXPO_PUBLIC_API_PORT: '9000' },
    );
    expect(api.baseUrl).toBe('http://192.168.0.2:9000');
  });
});

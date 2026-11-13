import { describe, expect, it } from 'vitest'
import { readEnvironment } from './environment.js'

describe('environment validation', () => {
  it('parses defaults and a comma-separated origin whitelist', () => {
    expect(
      readEnvironment({
        NODE_ENV: 'test',
        WEB_ORIGIN: 'https://one.example.com, https://two.example.com',
      }),
    ).toMatchObject({
      port: 3333,
      sessionTtlHours: 8,
      webOrigins: ['https://one.example.com', 'https://two.example.com'],
    })
  })

  it('rejects invalid environment values during initialization', () => {
    expect(() => readEnvironment({ NODE_ENV: 'test', PORT: '70000' })).toThrow()
    expect(() =>
      readEnvironment({ NODE_ENV: 'test', WEB_ORIGIN: 'not-a-url' }),
    ).toThrow()
    expect(() =>
      readEnvironment({ NODE_ENV: 'test', WEB_ORIGIN: 'ftp://example.com' }),
    ).toThrow()
    expect(() =>
      readEnvironment({
        NODE_ENV: 'test',
        DATABASE_URL: 'https://example.com/database',
      }),
    ).toThrow()
    expect(() =>
      readEnvironment({ NODE_ENV: 'test', ADMIN_REGISTRATION_KEY: 'short' }),
    ).toThrow()
  })

  it('requires a database URL outside the test environment', () => {
    expect(() => readEnvironment({ NODE_ENV: 'production' })).toThrow()
    expect(
      readEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL_POOLED: 'postgresql://user:password@host/database',
      }).pooledDatabaseUrl,
    ).toBe('postgresql://user:password@host/database')
  })
})

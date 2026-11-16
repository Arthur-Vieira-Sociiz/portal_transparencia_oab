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

  it('requires database and Firebase outside the test environment', () => {
    const firebaseEnvironment = {
      FIREBASE_PROJECT_ID: 'projeto-de-teste',
      FIREBASE_CLIENT_EMAIL: 'api@projeto-de-teste.iam.gserviceaccount.com',
      FIREBASE_PRIVATE_KEY:
        '-----BEGIN PRIVATE KEY-----\\nchave-de-teste-com-tamanho-suficiente\\n-----END PRIVATE KEY-----',
    }

    expect(() => readEnvironment({ NODE_ENV: 'production' })).toThrow()
    expect(() =>
      readEnvironment({
        NODE_ENV: 'production',
        ...firebaseEnvironment,
      }),
    ).toThrow()
    expect(() =>
      readEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL_POOLED: 'postgresql://user:password@host/database',
      }),
    ).toThrow()
    expect(
      readEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL_POOLED: 'postgresql://user:password@host/database',
        ...firebaseEnvironment,
      }).pooledDatabaseUrl,
    ).toBe('postgresql://user:password@host/database')

    // O cliente Firestore pode ser validado sem exigir a configuração do banco antigo.
    expect(
      readEnvironment(
        {
          NODE_ENV: 'production',
          ...firebaseEnvironment,
        },
        { requireDatabase: false },
      ).firebase?.projectId,
    ).toBe('projeto-de-teste')
  })
})

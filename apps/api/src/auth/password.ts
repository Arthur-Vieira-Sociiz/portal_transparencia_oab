import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'

const keyLength = 64

function deriveKey(password: string, salt: Buffer, length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, length, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }
      resolve(derivedKey)
    })
  })
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derivedKey = await deriveKey(password, salt, keyLength)

  return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, encodedSalt, encodedKey] = encodedHash.split('$')
  if (algorithm !== 'scrypt' || !encodedSalt || !encodedKey) return false

  const salt = Buffer.from(encodedSalt, 'base64url')
  const expectedKey = Buffer.from(encodedKey, 'base64url')
  const actualKey = await deriveKey(password, salt, expectedKey.length)

  return (
    expectedKey.length === actualKey.length &&
    timingSafeEqual(expectedKey, actualKey)
  )
}

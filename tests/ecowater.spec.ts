import { afterAll, describe, expect, it } from 'vitest'
import { EcoWater } from '../src/ecowater'
import { secret } from '../secret'

describe('Ecowater class', () => {
  const ecowater = new EcoWater(
    secret.username,
    secret.password,
    secret.serialNumber
  )

  afterAll(async () => {
    await ecowater.kill()
  })

  it(
    'should resolve promise with correct credentials',
    { timeout: 50_000 },
    async () => {
      const data = ecowater.getData()
      expect(data).resolves.toBeTruthy()
    }
  )
})

import axios from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import { ecowaterDataSchema, type EcoWaterData } from './data.validator'
import type { AxiosInstance } from 'axios'

export class EcoWater {
  #email: string
  #password: string
  #serialNumber!: string

  #requestVerificationToken: string = ''

  #caller: AxiosInstance

  constructor(usernameOrLogin: string, password: string, serialNumber: string) {
    this.#email = usernameOrLogin
    this.#password = password
    this.#serialNumber = serialNumber
    const cookieJar = new CookieJar()
    this.#caller = wrapper(axios.create({ jar: cookieJar }))
  }

  get #headers() {
    return {
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Connection: 'keep-alive',
      Referer: this.#referer,
    }
  }

  get #referer() {
    return `https://wifi.ecowater.com/Customer/Account/${this.#email.replace('@', '%40')}/${this.#serialNumber}`
  }

  async #saveVerificationToken() {
    return new Promise((resolve, reject) => {
      this.#caller
        .get('https://wifi.ecowater.com/Site/Login')
        .then((res) => {
          const regex: RegExp = new RegExp(
            /<input name="__RequestVerificationToken" type="hidden" value="([^"]*)" \/>/
          )
          const requestVerificationTokens = regex.exec(res.data)
          if (
            requestVerificationTokens &&
            requestVerificationTokens.length > 0
          ) {
            this.#requestVerificationToken = requestVerificationTokens[1] + ''
            resolve(true)
          } else {
            console.error('No token found')
            reject(new Error('No token found'))
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  async #login() {
    await this.#saveVerificationToken()
    return new Promise((resolve, reject) => {
      const payload = {
        Email: this.#email,
        Password: this.#password,
        __RequestVerificationToken: this.#requestVerificationToken,
      }
      this.#caller
        .post('https://wifi.ecowater.com/Site/Login', payload, {
          headers: this.#headers,
        })
        .then((res) => {
          const authCookie = res.config.jar
            ?.getCookiesSync('https://wifi.ecowater.com')
            .find((cookieHeader) =>
              cookieHeader.cookieString().includes('.ASPXAUTH')
            )
          if (!authCookie) {
            reject(new Error(`Haven't received auth cookie`))
          }
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  async isLoggedIn() {
    try {
      const url = `https://wifi.ecowater.com/Customer/Account/${this.#email}`
      const req = await this.#caller.get(url)
      const responseUrl = new URL(req.request.res.responseUrl)
      const responseStatus = responseUrl.searchParams.get('status')
      const isLoggedIn = responseStatus === null
      if (!isLoggedIn) {
        console.error(responseUrl)
      }
      return isLoggedIn
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async getData(): Promise<EcoWaterData> {
    await this.#login()
    return new Promise((resolve, reject) => {
      const payload = { dsn: this.#serialNumber }
      this.#caller
        .post(
          'https://wifi.ecowater.com/Dashboard/UpdateFrequentData',
          payload,
          {
            headers: this.#headers,
          }
        )
        .then((res) => {
          const data = ecowaterDataSchema.parse(res.data)

          resolve(data)
          return data
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  }

  async kill() {
    await this.#caller.delete('https://wifi.ecowater.com/Site/Logout')
  }
}

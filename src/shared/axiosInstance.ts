import axios, { AxiosInstance } from 'axios'

let instance: AxiosInstance

export const getInstance = (): AxiosInstance => {
  if(!instance) {
    throw new Error('Axios instance not initialized. You have likely forgot to call the initialize function.')
  }

  return instance
}

export const initialize = (token: string) => {
  instance = axios.create({
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
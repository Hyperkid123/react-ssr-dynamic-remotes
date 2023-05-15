import axios, { AxiosInstance } from 'axios'
import Cookie from 'js-cookie'

let instance: AxiosInstance

const token = Cookie.get('poc_auth_code')

export const getInstance = (): AxiosInstance => {
  if(!instance && token) {
    initialize(token)
  } else if(!instance && !token) {
    throw new Error('Axios instance not initialized. You have likely forgot to call the initialize function.')
  }

  return instance
}

export const initialize = (token: string) => {
  instance = axios.create({
    // @ts-ignore
    baseURL: global['IS_SERVER'] ? 'https://console.stage.redhat.com' : '/',
    headers: {
      Authorization: `Bearer ${token}`
    },
    proxy: {
      protocol: 'http',
      host: 'squid.corp.redhat.com',
      port: 3128
    }
  })
}

export const suspenseGet = (url: string) => {
  const response: {
    status: 'pending' | 'rejected' | 'fulfilled',
    data: any
  } = {
    status: 'pending',
    data: undefined
  }
  const suspense = getInstance().get(url).then(({data}) => {
    response.status = 'fulfilled'
    response.data = data
  }).catch(err => {
    response.status = 'rejected'
    response.data = err
  })

  return () => {
    switch(response.status) {
      case 'pending':
        throw suspense
      case 'rejected':
        throw response
      default:
        return response.data
    }
  }
}
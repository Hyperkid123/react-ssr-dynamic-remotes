import { getInstance } from "./axiosInstance"

export const getFedModules = () => {
  return getInstance().get('/api/chrome-service/v1/static/beta/stage/modules/fed-modules.json').then(({data}) => data)
}
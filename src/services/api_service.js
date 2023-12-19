import Config from '../config'

export default class ApiService {

  static prepare_headers() {
    return {
      'Content-type': 'application/json;charset=UTF-8',
      // 'Authorization': 's7cr7t',
    }
  }

  static async createChannel(data) {
    let url = Config.api.url + 'channels/create'
    let response = await fetch(url, {
      method: 'POST',
      headers: ApiService.prepare_headers(),
      body: JSON.stringify(data)
    })
    return ApiService.#buildResponse(response)
  }

  static async joinChannel(data) {
    let url = Config.api.url + 'channels/join'
    let response = await fetch(url, {
      method: 'POST',
      headers: ApiService.prepare_headers(),
      body: JSON.stringify(data)
    })
    return ApiService.#buildResponse(response)
  }

  // -----

  static async #buildResponse(response) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.indexOf('application/json') === -1) {
      return [response.status, await response.text(), response]
    }
    return [response.status, await response.json(), response]
  }
}


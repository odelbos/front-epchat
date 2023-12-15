export default class LocalStorageService {

  static hasUser() {
    return localStorage.getItem('user') !== null
  }

  static getUser() {
    return JSON.parse(localStorage.getItem('user'))
  }

  static setUser(user) {
    return localStorage.setItem('user', JSON.stringify(user))
  }

  static removeUser() {
    return localStorage.removeItem('user')
  }
}


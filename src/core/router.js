//
// Router
//
class Router {
  #listener = []
  #routes = null
  #source = null

  history = []
  currentRoute = null

  constructor(source, config) {
    this.#source = source
    this.#routes = this.#parseRoutes(config)
  }


  listen(fn) {
    this.#listener.push(fn)
  }

  callListener() {
    console.log('router : callListener :', this.#listener)
    this.#listener.forEach(l => l())
  }


  findRoute(routeName) {
    return this.#routes.find(r => r.name == routeName)
  }

  getCurrentRequest() {
    if (this.history.length === 0) return null
    return this.history[this.history.length - 1]
  }

  getPreviousRequest() {
    if (this.history.length > 1) {
     return this.history[this.history.length - 2]
    }
    return null
  }

  isPreviousRequestRedirect() {
    let previousRequest = this.getPreviousRequest()
    if (previousRequest !== null && previousRequest.status === 'redirect') {
      return true
    }
    return false
  }


  navigate(routeName, params={}, hash=null, state={}) {
    let path = this.routeToPath(routeName, params, hash)
    this.navigateToPath(path, state)
  }

  redirect(routeName, params={}, hash=null, state={}) {
    let path = this.routeToPath(routeName, params, hash)
    this.redirectToPath(path, state)
  }

  back() {
    let previousRequest = this.getPreviousRequest()
    if (previousRequest === null) {
      console.error('Cannot go back, no previous request')
      return
    }
    let url = previousRequest.getURL()
    let path = previousRequest.href.replace(url.origin, '')
    this.navigateToPath(path)
  }

  navigateToPath(path, state={}) {
    console.log('router : navigateToPath : ' + path)
    this.#source.history.pushState(state, null, path)
    this.resolve()
  }

  redirectToPath(path, state={}) {
    console.log('router : redirectToPath : ' + path)
    this.#source.history.replaceState(state, null, path)
    this.resolve()
  }

  routeToPath(routeName, params={}, hash=null) {
    let route = this.findRoute(routeName)
    if (route === undefined) {
      throw `Route does not exists !  (name: ${routeName})`
    }
    return route.to_path(params, hash)
  }


  resolve() {
    let location = this.#source.location
    console.log('router : resolve location : ' + location)

    let request = this.#prepareRequest(location)
    let match = this.#matchRoute(location)
    let route = match[0]
    request.routeParams = match[1]
    request.params = {...request.queryParams, ...request.routeParams}
    request.route = route === undefined ? null : route.name

    if (route.middlewares !== undefined) {

      for (let i = 0; i < route.middlewares.length; i++) {
        let m = route.middlewares[i]
        let s = m(this, request)
        if (s.status === 'redirect') {
          request.status = 'redirect'
          request.redirect = s.redirect
          //
          route = this.findRoute(s.redirect.route)
          //
          // TODO : if route === undefined ???
          //
          break
        }
      }
    }

    this.currentRoute = route

    if (request.status == 'ok') {
      if (route !== undefined) {
        this.history.push(request)
        this.callListener()
      }
    }
    else if (request.status == 'redirect') {
      let state = {}
      this.history.push(request)
      //
      // TODO : manage the params and hash of the redirect
      //
      this.redirect(request.redirect.route)
    }
    else if (request.status == 'no-match') {
      this.history.push(request)
      //
      // TODO
    }
    else if (request.status == 'cancel') {
      this.history.push(request)
      //
      // TODO
    }
    else {
      console.error(`Unknon status: #{request.status}`)
    }

    return [request, route]
  }


  #parseRoutes(routes) {
    let result = []

    result = routes.map(route => {

      let name = route.name
      if (name === undefined) {
        name = this.camelToDash(route.component.name.match(/Proxy<(.*)>/)[1])
      }

      return {
        name: name,
        path: route.path,
        layout: route.layout,
        component: route.component,
        middlewares: route.middlewares,

        segments: route.path
          .replace(/^\/+|\/+$/g, '')
          .split('/')
          .map(segment => ({
            name: segment.replace(':', ''),
            dyn: segment.startsWith(':')
          })),

        to_path(params={}, hash=null) {
          let _params = {...params}
          let path = this.path
          Object.keys(_params).forEach((key) => {
            let value = _params[key]
            if (value !== undefined && value !== null) {
              let segment = this.segments.find(s => s.name == key && s.dyn)
              if (segment !== undefined) {
                path = path.replace(':' + segment.name, value)
                delete _params[segment.name]
              }
            }
          })
          if (Object.keys(_params).length !== 0) {
            let qp = new URLSearchParams(_params).toString()
            path += '?' + qp
          }
          if (hash !== null && hash.length !== 0) {
            if (hash.startsWith('#')) path += hash
            else path += '#' + hash
          }
          return path
        }

      }
    })

    return result
  }

  #matchRoute(location) {
    let params = {}
    let path = decodeURI(location.pathname)
    let sp = path.replace(/^\/+|\/+$/g, '').split('/')

    let result = this.#routes.find(route => {
      // Wildcard route
      if (route.segments.length == 1 && route.segments[0].name == '*') return true

      if (route.segments.length !== sp.length) return false

      return sp.every((s, i) => {
        if (route.segments[i].name === s) return true

        if (route.segments[i].dyn) {
          // TODO: Validate param value
          params[route.segments[i].name] = s
          return true
        }
      })
    })

    return [result, params]
  }

  #prepareRequest(location) {
    let queryParams = {}
    let search = location.search
    if (search.length != 0) {
      if (search.startsWith('?')) search = search.substr(1)

      queryParams = search.split('&').reduce(function (res, item) {
        var parts = item.split('=')
        res[parts[0]] = parts[1]
        return res
      }, {})
    }

    return {
      status: 'ok',
      href: location.href,
      queryParams: queryParams,
      getURL() {
        return new URL(this.href)
      }
    }
  }


  camelToDash(str) {
    return str.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()
    // return str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()
  }
}

export default Router




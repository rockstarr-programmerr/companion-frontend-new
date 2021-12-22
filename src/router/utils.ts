import { Route, RoutePropsFunction, RouteConfig } from 'vue-router/types/router'

export function prefixWith (prefix: string, routeConfigs: Array<RouteConfig>): Array<RouteConfig> {
  return routeConfigs.map(routeConfig => {
    routeConfig.path = prefix + routeConfig.path
    return routeConfig
  })
}

export function castToNumber (args: string[]): RoutePropsFunction {
  function _castToNumber (route: Route) {
    const props = {}
    for (const prop of args) {
      const propVal = route.params[prop]
      const propValCasted = parseInt(propVal)
      // @ts-expect-error don't care
      props[prop] = propValCasted
    }
    return props
  }
  return _castToNumber
}

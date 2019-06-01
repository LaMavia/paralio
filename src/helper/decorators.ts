export const makePrivate: PropertyDecorator = (t, k) => {
  Object.defineProperty(t, k, {
    enumerable: false,
    configurable: true
  })
}
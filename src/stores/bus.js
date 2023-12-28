import { writable } from 'svelte/store'

const bus = writable(null)

export const emit = function(topic, data) {
  bus.set({ topic: topic, data: data })
}

export const subscribe = function(topic, fn) {
  const unsubscribe = bus.subscribe(e => {
    if (e && e.topic === topic) fn(topic, e.data)
  })
}

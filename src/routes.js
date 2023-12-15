import DefaultLayout from './layouts/DefaultLayout.svelte'
import Home from './pages/Home.svelte'
import Room from './pages/Room.svelte'

// -------------------------------------------------
// Routes settings
// -------------------------------------------------
const routes = [
  {
    path: '/',
    layout: DefaultLayout,
    component: Home,                        // Implicit route name: home
  },
  {
    path: '/room',
    layout: DefaultLayout,
    component: Room,                        // Implicit route name : room
  },
]

export default routes

import DefaultLayout from './layouts/DefaultLayout.svelte'
import Home from './pages/Home.svelte'
import Room from './pages/Room.svelte'
import Join from './pages/Join.svelte'

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
  {
    path: '/join/:channel_id',
    layout: DefaultLayout,
    component: Join,                        // Implicit route name : join
  },
]

export default routes

import DefaultLayout from './layouts/DefaultLayout.svelte'
import Home from './pages/Home.svelte'

// -------------------------------------------------
// Routes settings
// -------------------------------------------------
const routes = [
  {
    path: '/',
    layout: DefaultLayout,
    component: Home,                        // Implicit route name: home
  },
]

export default routes

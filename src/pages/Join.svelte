<script>
import { getContext } from 'svelte'
import LocalStorageService from '../services/local_storage_service'
import ApiService from '../services/api_service'
import { channel } from '../stores/data'
import Nickname from '../components/Nickname.svelte'
import Modal from '../components/Modal.svelte'

let router = getContext('ROUTER')
export let request

let token_id = request.params.token_id

let user = null
if (LocalStorageService.hasUser()) {
  user = LocalStorageService.getUser()
}

let dom = {
  invalidModal: null,
}

const modalConfig = {
  header: {
    show: true,
    title: 'Error',
  },

  footer: {
    show: true,
    btnLeft: true,
    btnLeftText: 'Go to Home',
  },
}

// -----

async function onClickValid(e) {
  let data = {
    nickname: e.detail.nickname,
    token_id: token_id,
  }
  if (user !== null) data.user_id = user.id

  let status, result
  [status, result] = await ApiService.joinChannel(data)
  if (status === 200) {
    console.log(result)                         // TODO: Remove debug code
    LocalStorageService.setUser(result.user)
    result.channel.token = result.token
    $channel = result.channel
    router.navigate('room')
  }
  else if (status === 400) {
    dom.invalidModal.open()
  }
  else {
    console.log(result)                         // TODO: Remove debug code
    // TODO: Properly manage the error
    throw 'API error'
  }
}

async function onGotoHome() {
  router.navigate('home')
}
</script>


<div class="container mt-40">
  <Nickname btnTitle="Join Chat Room" on:click-valid={onClickValid}/>
</div>

<Modal bind:this={dom.invalidModal} settings={modalConfig} on:click-left={onGotoHome}>
  <p class="mt-20 text-center">Invalid token.</p>
</Modal>

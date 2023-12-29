<script>
import { getContext } from 'svelte'
import LocalStorageService from '../services/local_storage_service'
import ApiService from '../services/api_service'
import { channel } from '../stores/data'
import Nickname from '../components/Nickname.svelte'

let router = getContext('ROUTER')
export let request

let token_id = request.params.token_id

let user = null
if (LocalStorageService.hasUser()) {
  user = LocalStorageService.getUser()
}

async function onClickValid(e) {
  let data = {
    nickname: e.detail.nickname,
    token_id: token_id,
  }
  if (user !== null) data.user_id = user.id

  let status, result
  [status, result] = await ApiService.joinChannel(data)
  if (status === 200) {
    console.log(result)
    LocalStorageService.setUser(result.user)
    $channel = result.channel
    router.navigate('room')
  }
  else {
    // TODO: Properly manage the error
    console.log(result)
    throw 'API error'
  }
}
</script>


<div class="container mt-40">
  <Nickname btnTitle="Join Chat Room" on:click-valid={onClickValid}/>
</div>

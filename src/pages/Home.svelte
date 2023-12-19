<script>
import { getContext } from 'svelte'
import LocalStorageService from '../services/local_storage_service'
import ApiService from '../services/api_service'
import { channel } from '../stores/data'
import Nickname from '../components/Nickname.svelte'

let router = getContext('ROUTER')

let user = null
if (LocalStorageService.hasUser()) {
  user = LocalStorageService.getUser()
}

async function onClickValid(e) {
  let data = {
    nickname: e.detail.nickname
  }
  if (user !== null) data.user_id = user.id

  let status, result
  [status, result] = await ApiService.createChannel(data)
  if (status === 200) {
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
  <Nickname btnTitle="Create Chat Room" on:click-valid={onClickValid}/>
</div>

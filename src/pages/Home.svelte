<script>
import { getContext } from 'svelte'
import ApiService from '../services/api_service'

let router = getContext('ROUTER')

let form = {
  nickname: '',
}

let gui = {
  btnValid: {
    isLoading: false,
    isDisabled: false,
  },
  nickname: {
    invalid: false,
    msg: '',
  },
}

function validForm() {
  if (form.nickname === null || form.nickname.trim().length < 2) {
    gui.nickname.msg = 'You must provide a nickname of more than 1 character'
    gui.nickname.invalid = true
    return false
  }
  gui.nickname.invalid = false
  return true
}

async function onClickValid() {
  if (! validForm()) return
  gui.btnValid.isLoading = true
  gui.btnValid.isDisabled = true


  let data = {
    nickname: form.nickname
  }

  let status, result
  [status, result] = await ApiService.createChannel(data)
  if (status === 200) {
    console.log('Request success:')
    console.log(result)
  }
  else {
    console.log('Api Error')
    throw 'API error'
  }



}
</script>


<div class="container mt-40">
  <label for="nickname-field" class="form-label">Nickname <sup class="required">*</sup></label>
  <input id="nickname-field" type="text" class="form-control" class:is-invalid={gui.nickname.invalid} bind:value={form.nickname}/>
  <div class="invalid-msg">{gui.nickname.msg}</div>
</div>

<div class="container mt-40 text-center">
  <button class="btn btn-primary" type="button" on:click={onClickValid} disabled={form.nickname === '' || gui.btnValid.isDisabled}>
    {#if gui.btnValid.isLoading}
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span class="visually-hidden">Loading...</span>
    {:else}
      Create Chat Room
    {/if}
  </button>
</div>

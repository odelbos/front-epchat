<script>
import { createEventDispatcher } from 'svelte'
import LocalStorageService from '../services/local_storage_service'

export let btnTitle = 'Valid'

const dispatch = createEventDispatcher()

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

let user = null
if (LocalStorageService.hasUser()) {
  user = LocalStorageService.getUser()
  form.nickname = user.nickname
}

function formValidNickname() {
  if (form.nickname === null || form.nickname.trim().length === 0) {
    gui.nickname.msg = "You must provide a nickname"
    gui.nickname.invalid = true
    return false
  }
  gui.nickname.invalid = false
  return true
}

function validForm() {
  return formValidNickname()
}

async function onClickValid() {
  if (! validForm()) return
  gui.btnValid.isLoading = true
  gui.btnValid.isDisabled = true
  dispatch('click-valid', {nickname: form.nickname})
}
</script>


<div class="container mt-40">
  <label for="nickname-field" class="form-label">Nickname <span class="required">*</span></label>
  <input id="nickname-field" type="text" class="form-control" class:is-invalid={gui.nickname.invalid} bind:value={form.nickname}/>
  <div class="invalid-msg">{gui.nickname.msg}</div>
</div>

<div class="container mt-40 text-center">
  <button class="btn btn-primary" type="button" on:click={onClickValid} disabled={form.nickname === '' || gui.btnValid.isDisabled}>
    {#if gui.btnValid.isLoading}
      <span class="visually-hidden">Loading...</span>
    {:else}
      {btnTitle}
    {/if}
  </button>
</div>

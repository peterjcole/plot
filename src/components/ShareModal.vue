<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content">
      <article class="message">
        <div class="message-header">
          <p>Share activity</p>
          <button class="delete" aria-label="delete" @click="$emit('close-modal')" v-clipboard=""></button>
        </div>
        <div class="message-body">
          <div class="content">
            <p>Copy the URL below to share your activity.</p>
            <div class="field is-grouped">
              <p class="control has-icons-left is-expanded">
                <input class="input" type="text" :value="sharedActivityUrl" v-focus onfocus="this.select()"/>
                <span class="icon is-small is-left"><font-awesome-icon icon="link" /></span>
              </p>
              <p class="control">
                <a class="button is-dark" v-clipboard="sharedActivityUrl"> Copy to clipboard </a>
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="$emit('close-modal')"></button>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'ShareModal',
  props: {
    sharedActivityUrl: {
      type: String,
      required: false,
    },
  },
  components: {
    FontAwesomeIcon,
  },
}
</script>

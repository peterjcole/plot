<template>
  <div class="modal is-active">
    <div class="modal-background" />
    <div class="modal-content">
      <article class="message">
        <div class="message-header">
          <p>Share activity</p>
          <button
            class="delete"
            aria-label="delete"
            @click="$emit('close-modal')"
          />
        </div>
        <div class="message-body">
          <div class="content">
            <p>Copy the URL below to share your activity.</p>
            <div class="field is-grouped">
              <p class="control has-icons-left is-expanded">
                <input
                  v-focus
                  class="input"
                  type="text"
                  :value="sharedActivityUrl"
                  onfocus="this.select()"
                >
                <span class="icon is-small is-left"><font-awesome-icon icon="link" /></span>
              </p>
              <p class="control">
                <a
                  v-clipboard="sharedActivityUrl"
                  class="button is-dark"
                > Copy to clipboard </a>
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      @click="$emit('close-modal')"
    />
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'ShareModal',
  components: {
    FontAwesomeIcon,
  },
  props: {
    sharedActivityUrl: {
      type: String,
      required: true,
    },
  },
}
</script>

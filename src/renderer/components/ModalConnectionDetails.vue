<template>
   <Teleport to="#window-content">
      <div class="modal active modal-lg">
         <a class="modal-overlay" @click="closeModal" />
         <div ref="trapRef" class="modal-container">
            <div class="modal-header pl-2">
               <div class="modal-title h6">
                  <div class="d-flex">
                     <BaseIcon
                        icon-name="mdiInformationOutline"
                        class="mr-1"
                        :size="24"
                     /> {{ t('connection.connectionDetails') }}
                  </div>
               </div>
               <a class="btn btn-clear c-hand" @click.stop="closeModal" />
            </div>
            <div class="modal-body pb-0">
               <div class="content">
                  <div class="panel">
                     <div class="panel-nav">
                        <ul class="tab tab-block">
                           <li
                              class="tab-item c-hand"
                              :class="{'active': selectedTab === 'general'}"
                              @click="selectTab('general')"
                           >
                              <a class="tab-link">{{ t('application.general') }}</a>
                           </li>
                           <li
                              v-if="clientCustomizations.sslConnection"
                              class="tab-item c-hand"
                              :class="{'active': selectedTab === 'ssl'}"
                              @click="selectTab('ssl')"
                           >
                              <a class="tab-link">{{ t('connection.ssl') }}</a>
                           </li>
                           <li
                              v-if="clientCustomizations.sshConnection"
                              class="tab-item c-hand"
                              :class="{'active': selectedTab === 'ssh'}"
                              @click="selectTab('ssh')"
                           >
                              <a class="tab-link">{{ t('connection.sshTunnel') }}</a>
                           </li>
                        </ul>
                     </div>
                     <div v-if="selectedTab === 'general'" class="panel-body py-0">
                        <div class="form-horizontal">
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.connectionName') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.name }}</span>
                                    <BaseIcon
                                       v-if="connection.name"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.name)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.client') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.client }}</span>
                                    <BaseIcon
                                       v-if="connection.client"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.client)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.hostName') }}/IP</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.host }}</span>
                                    <BaseIcon
                                       v-if="connection.host"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.host)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.port') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.port }}</span>
                                    <BaseIcon
                                       v-if="connection.port"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.port.toString())"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.user') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.user }}</span>
                                    <BaseIcon
                                       v-if="connection.user"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.user)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.password') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ showPassword ? connection.password : '••••••••' }}</span>
                                    <div class="d-flex">
                                       <BaseIcon
                                          v-if="connection.password"
                                          :icon-name="showPassword ? 'mdiEyeOff' : 'mdiEye'"
                                          :size="16"
                                          class="c-hand ml-2"
                                          @click="showPassword = !showPassword"
                                       />
                                       <BaseIcon
                                          v-if="connection.password"
                                          icon-name="mdiContentCopy"
                                          :size="16"
                                          class="c-hand ml-2"
                                          @click="copyToClipboard(connection.password)"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div v-if="clientCustomizations.database" class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('database.database') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.database }}</span>
                                    <BaseIcon
                                       v-if="connection.database"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.database)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div v-if="connection.schema" class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('database.schema') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.schema }}</span>
                                    <BaseIcon
                                       v-if="connection.schema"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.schema)"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div v-if="selectedTab === 'ssl'" class="panel-body py-0">
                        <div class="form-horizontal">
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.enableSsl') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static">
                                    {{ connection.ssl ? t('general.yes') : t('general.no') }}
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.caCertificate') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.ca || t('general.none') }}</span>
                                    <BaseIcon
                                       v-if="connection.ca"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.ca)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.certificate') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.cert || t('general.none') }}</span>
                                    <BaseIcon
                                       v-if="connection.cert"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.cert)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.privateKey') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.key || t('general.none') }}</span>
                                    <BaseIcon
                                       v-if="connection.key"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.key)"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div v-if="selectedTab === 'ssh'" class="panel-body py-0">
                        <div class="form-horizontal">
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.hostName') }}/IP</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.sshHost || t('general.none') }}</span>
                                    <BaseIcon
                                       v-if="connection.sshHost"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.sshHost)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.port') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.sshPort || t('general.none') }}</span>
                                    <BaseIcon
                                       v-if="connection.sshPort"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.sshPort.toString())"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.user') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.sshUser || t('general.none') }}</span>
                                    <BaseIcon
                                       v-if="connection.sshUser"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.sshUser)"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div class="form-group columns">
                              <div class="column col-5 col-sm-12">
                                 <label class="form-label cut-text">{{ t('connection.privateKey') }}</label>
                              </div>
                              <div class="column col-7 col-sm-12">
                                 <div class="form-static d-flex justify-between">
                                    <span>{{ connection.sshKey || t('general.none') }}</span>
                                    <BaseIcon
                                       v-if="connection.sshKey"
                                       icon-name="mdiContentCopy"
                                       :size="16"
                                       class="c-hand ml-2"
                                       @click="copyToClipboard(connection.sshKey)"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div class="modal-footer">
               <button class="btn btn-primary" @click="closeModal">
                  {{ t('general.close') }}
               </button>
            </div>
         </div>
      </div>
   </Teleport>
</template>

<script setup lang="ts">
import customizations from 'common/customizations';
import { ConnectionParams } from 'common/interfaces/antares';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useNotificationsStore } from '@/stores/notifications';

import BaseIcon from './BaseIcon.vue';

const { t } = useI18n();
const notifications = useNotificationsStore();

const props = defineProps<{
   connection: ConnectionParams;
}>();

const selectedTab = ref('general');
const showPassword = ref(false);
const clientCustomizations = customizations[props.connection.client];

const emit = defineEmits<{(e: 'close-modal'): void}>();

const selectTab = (tab: string) => {
   selectedTab.value = tab;
};

const closeModal = () => {
   emit('close-modal');
};

const copyToClipboard = async (text: string) => {
   try {
      await navigator.clipboard.writeText(text);
      notifications.addNotification({
         status: 'success',
         message: t('general.copied')
      });
   }
   catch (error) {
      notifications.addNotification({
         status: 'error',
         message: t('general.copyError')
      });
   }
};
</script>

<style lang="scss" scoped>
.form-static {
   padding: 0.4rem 0.4rem;
   background-color: var(--bg-color-light);
   border-radius: var(--border-radius);
   min-height: 1.8rem;
   line-height: 1rem;

   .mdi {
      opacity: 0.7;
      &:hover {
         opacity: 1;
      }
   }
}

.justify-between {
   justify-content: space-between;
   align-items: center;
}
</style>

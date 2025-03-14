<template>
   <BaseContextMenu
      :context-event="contextEvent"
      @close-context="closeContext"
   >
      <div class="context-element">
         <span class="d-flex">
            <BaseIcon
               icon-name="mdiContentCopy"
               class="mr-1 mt-1"
               :size="18"
            /> {{ t('general.copy') }}</span>
         <BaseIcon
            icon-name="mdiChevronRight"
            class="mt-1 text-light"
            :size="18"
         />
         <div class="context-submenu">
            <div
               v-if="selectedRows.length === 1"
               class="context-element"
               @click="copyCell"
            >
               <span class="d-flex">
                  <BaseIcon
                     icon-name="mdiNumeric0"
                     class="mr-1 mt-1 text-light"
                     :rotate="90"
                     :size="18"
                  /> {{ t('database.cell', 1) }}
               </span>
            </div>
            <div class="context-element" @click="copyRow('html')">
               <span class="d-flex">
                  <BaseIcon
                     icon-name="mdiTableRow"
                     class="mr-1 mt-1 text-light"
                     :size="18"
                  /> {{ t('database.row', selectedRows.length) }} ({{ t('database.table') }})
               </span>
            </div>
            <div class="context-element" @click="copyRow('json')">
               <span class="d-flex">
                  <BaseIcon
                     icon-name="mdiTableRow"
                     class="mr-1 mt-1 text-light"
                     :size="18"
                  /> {{ t('database.row', selectedRows.length) }} (JSON)
               </span>
            </div>
            <div class="context-element" @click="copyRow('csv')">
               <span class="d-flex">
                  <BaseIcon
                     icon-name="mdiTableRow"
                     class="mr-1 mt-1 text-light"
                     :size="18"
                  /> {{ t('database.row', selectedRows.length) }} (CSV)
               </span>
            </div>
            <div class="context-element" @click="copyRow('php')">
               <span class="d-flex">
                  <BaseIcon
                     icon-name="mdiTableRow"
                     class="mr-1 mt-1 text-light"
                     :size="18"
                  /> {{ t('database.row', selectedRows.length) }} (PHP)
               </span>
            </div>
            <div class="context-element" @click="copyRow('sql')">
               <span class="d-flex">
                  <BaseIcon
                     icon-name="mdiTableRow"
                     class="mr-1 mt-1 text-light"
                     :size="18"
                  /> {{ t('database.row', selectedRows.length) }} (SQL INSERT)
               </span>
            </div>
         </div>
      </div>
      <div
         v-if="selectedRows.length === 1 && selectedCell.isEditable && mode === 'table'"
         class="context-element"
         @click="pasteCell"
      >
         <span class="d-flex">
            <BaseIcon
               icon-name="mdiContentPaste"
               class="mr-1 mt-1 text-light"
               :size="18"
            /> {{ t('database.paste', 1) }}
         </span>
      </div>
      <div
         v-if="selectedRows.length === 1 && selectedCell.isEditable && mode === 'table'"
         class="context-element"
         @click="duplicateRow"
      >
         <span class="d-flex">
            <BaseIcon
               icon-name="mdiContentDuplicate"
               class="mr-1 mt-1 text-light"
               :size="18"
            /> {{ t('general.duplicate') }}
         </span>
      </div>
      <div
         v-if="selectedRows.length === 1 && selectedCell.isEditable && mode === 'table' && fakerGroup"
         class="context-element"
      >
         <span class="d-flex">
            <BaseIcon
               icon-name="mdiAutoFix"
               class="mr-1 mt-1 text-light"
               :size="18"
            /> {{ t('database.fillCell') }}
         </span>
         <BaseIcon
            icon-name="mdiChevronRight"
            class="mt-1 text-light"
            :size="18"
         />
         <div class="context-submenu">
            <div
               v-for="method in fakerMethods[fakerGroup]"
               :key="method.name"
               class="context-element"
               @click="fillCell(method)"
            >
               <span class="d-flex">
                  {{ t(`faker.${method.name}`) }}
               </span>
            </div>
         </div>
      </div>
      <div
         v-if="selectedRows.length === 1 && selectedCell.isEditable"
         class="context-element"
         @click="setNull"
      >
         <span class="d-flex">
            <BaseIcon
               icon-name="mdiNull"
               class="mr-1 mt-1 text-light"
               :size="18"
            /> {{ t('database.setNull') }}
         </span>
      </div>
      <div
         v-if="selectedCell.isEditable"
         class="context-element"
         @click="showConfirmModal"
      >
         <span class="d-flex">
            <BaseIcon
               icon-name="mdiDelete"
               class="mr-1 mt-1 text-light"
               :size="18"
            /> {{ t('database.deleteRows', selectedRows.length) }}
         </span>
      </div>
   </BaseContextMenu>
</template>

<script setup lang="ts">
import { DATE, DATETIME, FLOAT, LONG_TEXT, NUMBER, TEXT, TIME, UUID } from 'common/fieldTypes';
import { computed, Prop } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseContextMenu from '@/components/BaseContextMenu.vue';
import BaseIcon from '@/components/BaseIcon.vue';

const { t } = useI18n();

const props = defineProps({
   contextEvent: MouseEvent,
   selectedRows: Array,
   selectedCell: Object,
   mode: String as Prop<'table' | 'query'>
});

const emit = defineEmits([
   'show-delete-modal',
   'close-context',
   'set-null',
   'copy-cell',
   'copy-row',
   'duplicate-row',
   'fill-cell',
   'paste-cell'
]);

const fakerMethods = {
   string: [
      { name: 'word', group: 'lorem' },
      { name: 'text', group: 'lorem' },
      { name: 'firstName', group: 'name' },
      { name: 'lastName', group: 'name' },
      { name: 'jobTitle', group: 'name' },
      { name: 'phoneNumber', group: 'phone' },
      { name: 'exampleEmail', group: 'internet' },
      { name: 'ip', group: 'internet' },
      { name: 'domainName', group: 'internet' },
      { name: 'color', group: 'internet' },
      { name: 'uuid', group: 'random' }
   ],
   number: [
      { name: 'number', group: 'random' }
   ],
   float: [
      { name: 'float', group: 'random' },
      { name: 'amount', group: 'finance' }
   ],
   datetime: [
      { name: 'now', group: 'date' },
      { name: 'past', group: 'date' },
      { name: 'future', group: 'date' }
   ],
   time: [
      { name: 'now', group: 'time' },
      { name: 'random', group: 'time' }
   ],
   uuid: [
      { name: 'uuid', group: 'random' }
   ]
};

const fakerGroup = computed(() => {
   if ([...TEXT, ...LONG_TEXT].includes(props.selectedCell.type))
      return 'string';
   else if (NUMBER.includes(props.selectedCell.type))
      return 'number';
   else if (FLOAT.includes(props.selectedCell.type))
      return 'float';
   else if ([...DATE, ...DATETIME].includes(props.selectedCell.type))
      return 'datetime';
   else if (TIME.includes(props.selectedCell.type))
      return 'time';
   else if (UUID.includes(props.selectedCell.type))
      return 'uuid';
   else
      return false;
});

const showConfirmModal = () => {
   emit('show-delete-modal');
};

const closeContext = () => {
   emit('close-context');
};

const setNull = () => {
   emit('set-null');
   closeContext();
};

const copyCell = () => {
   emit('copy-cell');
   closeContext();
};

const pasteCell = () => {
   emit('paste-cell');
   closeContext();
};

const copyRow = (format: string) => {
   emit('copy-row', format);
   closeContext();
};

const duplicateRow = () => {
   emit('duplicate-row');
   closeContext();
};

const fillCell = (method: {name: string; group: string}) => {
   emit('fill-cell', { ...method, type: fakerGroup.value });
   closeContext();
};
</script>

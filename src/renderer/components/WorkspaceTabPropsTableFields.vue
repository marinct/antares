<template>
   <div
      ref="tableWrapper"
      class="vscroll"
      :style="{'height': resultsSize+'px'}"
   >
      <TableContext
         v-if="isContext"
         :context-event="contextEvent"
         :selected-field="selectedField"
         :index-types="indexTypes"
         :indexes="indexes"
         @delete-selected="removeField"
         @duplicate-selected="duplicateField"
         @close-context="isContext = false"
         @add-new-index="emit('add-new-index', $event)"
         @add-to-index="emit('add-to-index', $event)"
      />
      <div ref="propTable" class="table table-hover">
         <div class="thead">
            <div class="tr">
               <div class="th">
                  <div class="text-right">
                     {{ t('database.order') }}
                  </div>
               </div>
               <div class="th">
                  <div class="table-column-title">
                     {{ t('database.key', 2) }}
                  </div>
               </div>
               <div class="th">
                  <div class="column-resizable min-100">
                     <div class="table-column-title">
                        {{ t('general.name') }}
                     </div>
                  </div>
               </div>
               <div class="th">
                  <div class="column-resizable min-100">
                     <div class="table-column-title">
                        {{ t('database.type') }}
                     </div>
                  </div>
               </div>
               <div v-if="customizations.tableArray" class="th">
                  <div class="column-resizable">
                     <div class="table-column-title">
                        {{ t('database.array') }}
                     </div>
                  </div>
               </div>
               <div class="th">
                  <div class="column-resizable">
                     <div class="table-column-title">
                        {{ t('database.length') }}
                     </div>
                  </div>
               </div>
               <div v-if="customizations.unsigned" class="th">
                  <div class="column-resizable">
                     <div class="table-column-title">
                        {{ t('database.unsigned') }}
                     </div>
                  </div>
               </div>
               <div v-if="customizations.nullable" class="th">
                  <div class="column-resizable">
                     <div class="table-column-title">
                        {{ t('database.allowNull') }}
                     </div>
                  </div>
               </div>
               <div v-if="customizations.zerofill" class="th">
                  <div class="column-resizable">
                     <div class="table-column-title">
                        {{ t('database.zeroFill') }}
                     </div>
                  </div>
               </div>
               <div class="th">
                  <div class="column-resizable">
                     <div class="table-column-title">
                        {{ t('database.default') }}
                     </div>
                  </div>
               </div>
               <div v-if="customizations.comment" class="th">
                  <div class="column-resizable">
                     <div class="table-column-title">
                        {{ t('database.comment') }}
                     </div>
                  </div>
               </div>
               <div v-if="customizations.collation" class="th">
                  <div class="column-resizable min-100">
                     <div class="table-column-title">
                        {{ t('database.collation') }}
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <Draggable
            ref="resultTable"
            :list="fields"
            class="tbody"
            item-key="_antares_id"
            handle=".row-draggable"
         >
            <template #item="{element}">
               <TableRow
                  :row="element"
                  :indexes="getIndexes(element.name)"
                  :foreigns="getForeigns(element.name)"
                  :data-types="dataTypes"
                  :customizations="customizations"
                  @contextmenu="contextMenu"
                  @rename-field="emit('rename-field', $event)"
               />
            </template>
         </Draggable>
      </div>
   </div>
</template>

<script setup lang="ts">
import { TableField, TableForeign, TableIndex } from 'common/interfaces/antares';
import { storeToRefs } from 'pinia';
import { Component, computed, onMounted, onUnmounted, onUpdated, Prop, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import * as Draggable from 'vuedraggable';

import TableContext from '@/components/WorkspaceTabPropsTableContext.vue';
import TableRow from '@/components/WorkspaceTabPropsTableRow.vue';
import { useConsoleStore } from '@/stores/console';
import { useWorkspacesStore } from '@/stores/workspaces';

const { t } = useI18n();

const props = defineProps({
   fields: Array as Prop<TableField[]>,
   indexes: Array as Prop<TableIndex[]>,
   foreigns: Array as Prop<TableForeign[]>,
   indexTypes: Array as Prop<string[]>,
   tabUid: [String, Number],
   connUid: String,
   table: String,
   schema: String,
   mode: String
});

const emit = defineEmits([
   'add-new-index',
   'add-to-index',
   'rename-field',
   'duplicate-field',
   'remove-field'
]);

const workspacesStore = useWorkspacesStore();
const consoleStore = useConsoleStore();

const { getWorkspace } = workspacesStore;

const { consoleHeight } = storeToRefs(consoleStore);

const tableWrapper: Ref<HTMLDivElement> = ref(null);
const propTable: Ref<HTMLDivElement> = ref(null);
const resultTable: Ref<Component> = ref(null);
const resultsSize = ref(1000);
const isContext = ref(false);
const contextEvent = ref(null);
const selectedField = ref(null);
const scrollElement = ref(null);

const customizations = computed(() => getWorkspace(props.connUid).customizations);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataTypes = computed(() => getWorkspace(props.connUid).dataTypes) as any;
const fieldsLength = computed(() => props.fields.length);

const resizeResults = () => {
   if (resultTable.value) {
      const el = tableWrapper.value;

      if (el) {
         let sizeToSubtract = 0;
         const footer = document.getElementById('footer');
         if (footer) sizeToSubtract += footer.offsetHeight;

         sizeToSubtract += consoleHeight.value;

         const size = window.innerHeight - el.getBoundingClientRect().top - sizeToSubtract;
         resultsSize.value = size;
      }
   }
};

const refreshScroller = () => {
   resizeResults();
};

const contextMenu = (event: MouseEvent, uid: string) => {
   selectedField.value = props.fields.find(field => field._antares_id === uid);
   contextEvent.value = event;
   isContext.value = true;
};

const duplicateField = () => {
   emit('duplicate-field', selectedField.value._antares_id);
};

const removeField = () => {
   emit('remove-field', selectedField.value._antares_id);
};

const getIndexes = (field: string) => {
   return props.indexes.reduce((acc, curr) => {
      acc.push(...curr.fields.map(f => ({ name: f, type: curr.type })));
      return acc;
   }, []).filter(f => f.name === field);
};

const getForeigns = (field: string) => {
   return props.foreigns.reduce((acc, curr) => {
      if (curr.field === field)
         acc.push(`${curr.refTable}.${curr.refField}`);
      return acc;
   }, []);
};

watch(fieldsLength, () => {
   refreshScroller();
});

watch(consoleHeight, () => {
   resizeResults();
});

onUpdated(() => {
   if (propTable.value)
      refreshScroller();

   if (tableWrapper.value)
      scrollElement.value = tableWrapper.value;
});

onMounted(() => {
   window.addEventListener('resize', resizeResults);
});

onUnmounted(() => {
   window.removeEventListener('resize', resizeResults);
});

defineExpose({ tableWrapper });
</script>

<style lang="scss" scoped>
.column-resizable {
  &:hover,
  &:active {
    resize: horizontal;
    overflow: hidden;
  }
}

.vscroll {
  overflow: auto;
}

.min-100 {
  min-width: 100px !important;
}

.table {
   min-width: 100%;
}
</style>

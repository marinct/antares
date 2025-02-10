<template>
   <div
      v-show="isSelected"
      class="workspace-query-tab column col-12 columns col-gapless no-outline p-0"
      tabindex="0"
   >
      <div class="workspace-query-runner column col-12">
         <div class="workspace-query-runner-inner" :style="{ height: `${editorHeight}px` }">
            <QueryEditor
               v-show="isSelected"
               id="query-editor"
               ref="queryEditor"
               v-model="query"
               style="flex:1;"
               :auto-focus="true"
               :workspace="workspace"
               :schema="breadcrumbsSchema"
               :is-selected="isSelected"
               :height="editorHeight"
               editor-classes="editor-query"
            />
            <QueryBindingPanel
               v-if="showBindingVars"
               :parameters="bindingParameters"
               :client="props.connection.client"
               @change="updateBindings"
            />
         </div>
         <div ref="resizer" class="query-area-resizer" />
         <div ref="queryAreaFooter" class="workspace-query-runner-footer">
            <div class="workspace-query-buttons">
               <div
                  @mouseenter="setCancelButtonVisibility(true)"
                  @mouseleave="setCancelButtonVisibility(false)"
               >
                  <button
                     v-if="showCancel && isQuering"
                     class="btn btn-primary btn-sm cancellable"
                     :disabled="!query"
                     :title="t('general.cancel')"
                     @click="killTabQuery()"
                  >
                     <BaseIcon icon-name="mdiWindowClose" :size="24" />
                     <span class="d-invisible pr-1">{{ t('general.run') }}</span>
                  </button>
                  <button
                     v-else
                     class="btn btn-primary btn-sm"
                     :class="{'loading':isQuering}"
                     :disabled="!query"
                     @click="runQuery(query)"
                  >
                     <BaseIcon
                        class="mr-1"
                        icon-name="mdiPlay"
                        :size="24"
                     />
                     <span>{{ t('general.run') }}</span>
                  </button>
               </div>
               <button
                  v-if="!autocommit"
                  class="btn btn-dark btn-sm"
                  :class="{'loading':isQuering}"
                  @click="commitTab()"
               >
                  <BaseIcon
                     class="mr-1"
                     icon-name="mdiCubeSend"
                     :size="24"
                  />
                  <span>{{ t('database.commit') }}</span>
               </button>
               <button
                  v-if="!autocommit"
                  class="btn btn-dark btn-sm"
                  :class="{'loading':isQuering}"
                  @click="rollbackTab()"
               >
                  <BaseIcon
                     class="mr-1"
                     icon-name="mdiUndoVariant"
                     :size="24"
                  />
                  <span>{{ t('database.rollback') }}</span>
               </button>
               <button
                  class="btn btn-link btn-sm mr-0"
                  :disabled="!query || isQuering"
                  @click="clear()"
               >
                  <BaseIcon
                     class="mr-1"
                     icon-name="mdiDeleteSweep"
                     :size="24"
                  />
                  <span>{{ t('general.clear') }}</span>
               </button>

               <div class="divider-vert py-3" />

               <button
                  class="btn btn-dark btn-sm"
                  :disabled="!query || isQuering"
                  :title="t('general.format')"
                  @click="beautify()"
               >
                  <BaseIcon icon-name="mdiBrush" :size="24" />
               </button>
               <div class="btn-group">
                  <button
                     class="btn btn-dark btn-sm mr-0"
                     :disabled="!filePath || lastSavedQuery === query"
                     :title="t('application.saveFile')"
                     @click="saveFile()"
                  >
                     <BaseIcon icon-name="mdiContentSaveCheckOutline" :size="24" />
                  </button>
                  <button
                     class="btn btn-dark btn-sm mr-0"
                     :title="t('application.saveFileAs')"
                     @click="saveFileAs()"
                  >
                     <BaseIcon icon-name="mdiContentSavePlusOutline" :size="24" />
                  </button>
                  <button
                     class="btn btn-dark btn-sm"
                     :title="t('application.openFile')"
                     @click="openFile()"
                  >
                     <BaseIcon icon-name="mdiFolderOpenOutline" :size="24" />
                  </button>
               </div>
               <div class="btn-group">
                  <button
                     class="btn btn-dark btn-sm mr-0"
                     :disabled="isQuering || (isQuerySaved || query.length < 5)"
                     :title="t('application.saveAsNote')"
                     @click="saveQuery()"
                  >
                     <BaseIcon icon-name="mdiHeartPlusOutline" :size="24" />
                  </button>
                  <button
                     class="btn btn-dark btn-sm"
                     :disabled="isQuering"
                     :title="t('database.savedQueries')"
                     @click="openSavedModal()"
                  >
                     <BaseIcon icon-name="mdiNotebookHeartOutline" :size="24" />
                  </button>
               </div>
               <button
                  class="btn btn-dark btn-sm"
                  :disabled="isQuering"
                  :title="t('general.history')"
                  @click="openHistoryModal()"
               >
                  <BaseIcon icon-name="mdiHistory" :size="24" />
               </button>
               <div class="dropdown table-dropdown pr-2">
                  <button
                     :disabled="!hasResults || isQuering"
                     class="btn btn-dark btn-sm dropdown-toggle mr-0 pr-0"
                     tabindex="0"
                  >
                     <BaseIcon
                        class="mr-1"
                        icon-name="mdiFileExport"
                        :size="24"
                     />
                     <span>{{ t('database.export') }}</span>
                     <BaseIcon
                        class="mr-1"
                        icon-name="mdiMenuDown"
                        :size="24"
                     />
                  </button>
                  <ul class="menu text-left">
                     <li class="menu-item">
                        <a class="c-hand" @click="downloadTable('json')">JSON</a>
                     </li>
                     <li class="menu-item">
                        <a class="c-hand" @click="downloadTable('csv')">CSV</a>
                     </li>
                     <li class="menu-item">
                        <a class="c-hand" @click="downloadTable('php')">{{ t('application.phpArray') }}</a>
                     </li>
                     <li class="menu-item">
                        <a class="c-hand" @click="downloadTable('sql')">SQL INSERT</a>
                     </li>
                  </ul>
               </div>
               <div class="input-group pr-2" :title="t('database.commitMode')">
                  <BaseIcon
                     class="input-group-addon addon-sm p-0"
                     icon-name="mdiSourceCommit"
                     :size="28"
                  />
                  <BaseSelect
                     v-model="autocommit"
                     :options="[{value: true, label: t('database.autoCommit')}, {value: false, label: t('database.manualCommit')}]"
                     :option-label="(opt: any) => opt.label"
                     :option-track-by="(opt: any) => opt.value"
                     class="form-select select-sm text-bold"
                  />
               </div>
            </div>
            <div class="workspace-query-info">
               <div
                  v-if="results.length"
                  class="d-flex"
                  :title="t('database.queryDuration')"
               >
                  <BaseIcon
                     class="mr-1 mt-1"
                     icon-name="mdiTimerSand"
                     :rotate="180"
                     :size="16"
                  /> <b>{{ durationsCount / 1000 }}s</b>
               </div>
               <div
                  v-if="resultsCount"
                  class="d-flex"
                  :title="t('general.results')"
               >
                  <BaseIcon
                     class="mr-1 mt-1"
                     icon-name="mdiEqual"
                     :size="16"
                  /> <b>{{ resultsCount.toLocaleString() }}</b>
               </div>
               <div
                  v-if="hasAffected"
                  class="d-flex"
                  :title="t('database.affectedRows')"
               >
                  <BaseIcon
                     class="mr-1 mt-1"
                     icon-name="mdiTarget"
                     :size="16"
                  />  <b>{{ affectedCount }}</b>
               </div>
               <div class="input-group" :title="t('database.schema')">
                  <BaseIcon
                     class="input-group-addon addon-sm p-0 px-1"
                     icon-name="mdiDatabase"
                     :size="28"
                  />

                  <BaseSelect
                     v-model="selectedSchema"
                     :options="[{value: null, label: t('database.noSchema')}, ...databaseSchemas.map(el => ({label: el, value: el}))]"
                     class="form-select select-sm text-bold"
                  />
               </div>
            </div>
         </div>
      </div>
      <WorkspaceTabQueryEmptyState v-if="!results.length && !isQuering" :customizations="workspace.customizations" />
      <div class="workspace-query-results p-relative column col-12">
         <BaseLoader v-if="isQuering" />
         <WorkspaceTabQueryTable
            v-if="results"
            v-show="!isQuering"
            ref="queryTable"
            :is-quering="isQuering"
            :results="results"
            :tab-uid="tab.uid"
            :conn-uid="connection.uid"
            :is-selected="isSelected"
            mode="query"
            @update-field="updateField"
            @delete-selected="deleteSelected"
         />
      </div>
      <ModalHistory
         v-if="isHistoryOpen"
         :connection="connection"
         @select-query="selectQuery"
         @close="isHistoryOpen = false"
      />
   </div>
</template>

<script setup lang="ts">
import { getCurrentWindow, Menu } from '@electron/remote';
import { Ace } from 'ace-builds';
import { ConnectionParams } from 'common/interfaces/antares';
import { uidGen } from 'common/libs/uidGen';
import { ipcRenderer } from 'electron';
import { debounce } from 'lodash';
import { storeToRefs } from 'pinia';
import { format } from 'sql-formatter';
import { Component, computed, onBeforeUnmount, onMounted, Prop, Ref, ref, toRaw, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseIcon from '@/components/BaseIcon.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import ModalHistory from '@/components/ModalHistory.vue';
import QueryBindingPanel from '@/components/QueryBindingPanel.vue';
import QueryEditor from '@/components/QueryEditor.vue';
import WorkspaceTabQueryEmptyState from '@/components/WorkspaceTabQueryEmptyState.vue';
import WorkspaceTabQueryTable from '@/components/WorkspaceTabQueryTable.vue';
import { useResultTables } from '@/composables/useResultTables';
import Application from '@/ipc-api/Application';
import Schema from '@/ipc-api/Schema';
import { useApplicationStore } from '@/stores/application';
import { useConsoleStore } from '@/stores/console';
import { useHistoryStore } from '@/stores/history';
import { useNotificationsStore } from '@/stores/notifications';
import { useScratchpadStore } from '@/stores/scratchpad';
import { useSettingsStore } from '@/stores/settings';
import { useWorkspacesStore } from '@/stores/workspaces';

const { t } = useI18n();

const props = defineProps({
   tabUid: String,
   connection: Object as Prop<ConnectionParams>,
   tab: Object,
   isSelected: Boolean
});

const reloadTable = () => runQuery(lastQuery.value);

const {
   queryTable,
   isQuering,
   updateField,
   deleteSelected
} = useResultTables(props.connection.uid, reloadTable);

const { saveHistory } = useHistoryStore();
const { addNotification } = useNotificationsStore();
const workspacesStore = useWorkspacesStore();
const { showScratchpad } = useApplicationStore();
const { addNote } = useScratchpadStore();

const { consoleHeight } = storeToRefs(useConsoleStore());
const { executeSelected } = storeToRefs(useSettingsStore());

const {
   getWorkspace,
   changeBreadcrumbs,
   updateTabContent,
   setUnsavedChanges,
   newTab
} = workspacesStore;

const queryEditor: Ref<Component & { editor: Ace.Editor; $el: HTMLElement }> = ref(null);
const queryAreaFooter: Ref<HTMLDivElement> = ref(null);
const resizer: Ref<HTMLDivElement> = ref(null);
const queryName = ref('');
const query = ref('');
const filePath = ref('');
const lastQuery = ref('');
const lastSavedQuery = ref('');
const isCancelling = ref(false);
const showCancel = ref(false);
const autocommit = ref(true);
const results = ref([]);
const selectedSchema = ref(null);
const resultsCount = ref(0);
const durationsCount = ref(0);
const affectedCount = ref(null);
const editorHeight = ref(200);
const isQuerySaved = ref(false);
const isHistoryOpen = ref(false);
const debounceTimeout = ref(null);
const showBindingVars = ref(false);
const bindingParameters = ref([]);
const bindingValues = ref<{ rawValues: Record<string, string>; values: Record<string, string> } | null>(null);

const workspace = computed(() => getWorkspace(props.connection.uid));
const breadcrumbsSchema = computed(() => workspace.value.breadcrumbs.schema || null);
const databaseSchemas = computed(() => {
   return workspace.value.structure.reduce((acc, curr) => {
      acc.push(curr.name);
      return acc;
   }, []);
});
const hasResults = computed(() => results.value.length && results.value[0].rows);
const hasAffected = computed(() => affectedCount.value || (!resultsCount.value && affectedCount.value !== null));
const isChanged = computed(() => {
   return filePath.value && lastSavedQuery.value !== query.value;
});

watch(query, (val) => {
   clearTimeout(debounceTimeout.value);

   shouldShowBindingPanel(val);

   debounceTimeout.value = setTimeout(() => {
      updateTabContent({
         elementName: queryName.value,
         filePath: filePath.value,
         uid: props.connection.uid,
         tab: props.tab.uid,
         type: 'query',
         schema: selectedSchema.value,
         content: val

      });

      isQuerySaved.value = false;
   }, 200);
});

watch(queryName, (val) => {
   clearTimeout(debounceTimeout.value);

   debounceTimeout.value = setTimeout(() => {
      updateTabContent({
         elementName: val,
         filePath: filePath.value,
         uid: props.connection.uid,
         tab: props.tab.uid,
         type: 'query',
         schema: selectedSchema.value,
         content: query.value
      });

      isQuerySaved.value = false;
   }, 200);
});

watch(() => props.isSelected, (val) => {
   if (val) {
      changeBreadcrumbs({ schema: selectedSchema.value, query: `Query #${props.tab.index}` });
      setTimeout(() => {
         if (queryEditor.value)
            queryEditor.value.editor.focus();
      }, 0);
   }
});

watch(selectedSchema, () => {
   changeBreadcrumbs({ schema: selectedSchema.value, query: `Query #${props.tab.index}` });
});

watch(databaseSchemas, () => {
   if (!databaseSchemas.value.includes(selectedSchema.value))
      selectedSchema.value = null;
}, { deep: true });

watch(() => props.tab.content, () => {
   query.value = props.tab.content;
   const editorValue = queryEditor.value.editor.session.getValue();

   if (editorValue !== query.value)// If change not rendered in editor
      queryEditor.value.editor.session.setValue(query.value);
});

watch(isChanged, (val) => {
   setUnsavedChanges({ uid: props.connection.uid, tUid: props.tabUid, isChanged: val });
});

const shouldShowBindingPanel = (query: string) => {
   const bindingVars = extractBindingVariables(query);
   bindingParameters.value = bindingVars;
   showBindingVars.value = bindingVars.length > 0;
};

const extractBindingVariables = (query: string) => {
   // First, let's identify and remove multi-line comments
   const multilineCommentRegex = /\/\*[\s\S]*?\*\//g;
   const queryWithoutMultilineComments = query.replace(multilineCommentRegex, '');

   // Split the query into lines to handle single-line comments
   const lines = queryWithoutMultilineComments.split('\n');
   const uncommentedLines = lines.map(line => {
      const commentIndex = line.indexOf('--');
      return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
   }).join('\n');

   const bindings = new Map();

   // Find all binding variables and their surrounding context
   const bindingRegex = /:([a-zA-Z]\w*)/g;
   const allBindings = new Set();

   // Helper to extract context between parentheses
   const getParenthesesContext = (text: string, startIndex: number): string => {
      let parenCount = 0;
      let start = -1;

      // Look backwards for opening parenthesis
      for (let i = startIndex; i >= 0; i--) {
         if (text[i] === ')') parenCount++;
         if (text[i] === '(') {
            parenCount--;
            if (parenCount === -1) {
               start = i;
               break;
            }
         }
      }

      if (start === -1) return '';

      parenCount = 1;
      // Look forward for closing parenthesis
      for (let i = start + 1; i < text.length; i++) {
         if (text[i] === '(') parenCount++;
         if (text[i] === ')') {
            parenCount--;
            if (parenCount === 0) {
               const context = text.substring(start, i + 1);
               return context.replace(/:([a-zA-Z]\w*)/g, '_');
            }
         }
      }
      return '';
   };

   // Helper to get the surrounding words/operators
   const getSurroundingContext = (text: string, matchIndex: number, varLength: number): string => {
      const beforeMatch = text.substring(0, matchIndex).trim();
      const afterMatch = text.substring(matchIndex + varLength).trim();

      // Look for specific patterns
      // 1. IS NULL, IS NOT NULL
      const isNullMatch = afterMatch.match(/^IS\s+(?:NOT\s+)?NULL\b/i);
      if (isNullMatch)
         return `_ ${isNullMatch[0]}`;

      // 2. Column comparison
      const beforeWords = beforeMatch.split(/\s+/).slice(-2);
      const columnMatch = beforeWords.find(word => /^[a-zA-Z]\w*(?:\.[a-zA-Z]\w*)?$/.test(word));
      if (columnMatch) {
         const operator = beforeWords[beforeWords.length - 1];
         if (/^[=<>!]+$/.test(operator))
            return `${columnMatch} ${operator} _`;

         return columnMatch;
      }

      // 3. INTERVAL context
      if (beforeMatch.toUpperCase().endsWith('INTERVAL')) {
         const unitMatch = afterMatch.match(/^[A-Z]+\b/);
         if (unitMatch)
            return `INTERVAL _ ${unitMatch[0]}`;
      }

      // 4. Function context (first parent function)
      const parenthesesContext = getParenthesesContext(text, matchIndex);
      if (parenthesesContext) {
         // Get function name if available
         const beforeParens = text.substring(0, text.indexOf(parenthesesContext)).trim();
         const funcMatch = beforeParens.match(/([A-Za-z]\w*)\s*$/);
         if (funcMatch)
            return `${funcMatch[1]}${parenthesesContext}`;

         return parenthesesContext;
      }

      // 5. Default to nearby words
      const nearbyWords = [
         ...beforeWords.slice(-1),
         '_',
         ...afterMatch.split(/\s+/).slice(0, 1)
      ].filter(Boolean);

      return nearbyWords.join(' ');
   };

   let match;
   while ((match = bindingRegex.exec(uncommentedLines)) !== null) {
      const bindingVar = match[1];
      allBindings.add(bindingVar);

      if (!bindings.has(bindingVar)) {
         const context = getSurroundingContext(uncommentedLines, match.index, match[0].length);
         bindings.set(bindingVar, context);
      }
   }

   return [...allBindings].map(name => ({
      name,
      column: bindings.get(name) || '',
      type: inferTypeFromContext(bindings.get(name) || ''),
      value: ''
   }));
};

const inferTypeFromContext = (context: string): string => {
   const contextLower = context.toLowerCase();

   if (/\bis\s+(?:not\s+)?null\b/.test(contextLower)) return 'BOOLEAN';
   if (/interval\s+_\s+(?:second|minute|hour|day|month|year)/.test(contextLower)) return 'INT';
   if (/^id$|_id\s|^\(.*_id/.test(contextLower)) return 'INT';
   if (/date|time|_at\s/.test(contextLower)) return 'DATETIME';
   if (/price|amount|total|cost/.test(contextLower)) return 'DECIMAL';
   if (/count|number|qty|quantity|days?|hours?|minutes?|seconds?/.test(contextLower)) return 'INT';

   return 'VARCHAR';
};

const updateBindings = (event: { rawValues: Record<string, string>; values: Record<string, string> }) => {
   bindingValues.value = event;
};

const runQueryInternal = async (query: string) => {
   if (!query || isQuering.value) return;
   isQuering.value = true;

   if (executeSelected.value) {
      const selectedQuery = queryEditor.value.editor.getSelectedText();
      if (selectedQuery) query = selectedQuery;
   }

   clearTabData();
   queryTable.value.resetSort();

   try { // Query Data
      const params = {
         uid: props.connection.uid,
         schema: selectedSchema.value,
         tabUid: props.tab.uid,
         autocommit: autocommit.value,
         query
      };

      const { status, response } = await Schema.rawQuery(params);

      if (status === 'success') {
         results.value = Array.isArray(response) ? response : [response];
         resultsCount.value = results.value.reduce((acc, curr) => acc + (curr.rows ? curr.rows.length : 0), 0);
         durationsCount.value = results.value.reduce((acc, curr) => acc + curr.duration, 0);
         affectedCount.value = results.value
            .filter(result => result.report !== null)
            .reduce((acc, curr) => {
               if (acc === null) acc = 0;
               return acc + (curr.report ? curr.report.affectedRows : 0);
            }, null);

         saveHistory(params);
         if (!autocommit.value)
            setUnsavedChanges({ uid: props.connection.uid, tUid: props.tabUid, isChanged: true });

         queryEditor.value.editor.focus();
      }
      else
         addNotification({ status: 'error', message: response });
   }
   catch (err) {
      addNotification({ status: 'error', message: err.stack });
   }

   isQuering.value = false;
   lastQuery.value = query;
};

const runQuery = async (query: string) => {
   if (executeSelected.value) {
      const selectedQuery = queryEditor.value.editor.getSelectedText();
      if (selectedQuery) query = selectedQuery;
      shouldShowBindingPanel(query);
   }

   if (bindingParameters.value.length > 0) {
      let params = Object.fromEntries(bindingParameters.value.map(param => [param, null]));

      if (bindingValues.value)
         params = bindingValues.value.values;

      await runQueryInternal(replaceBindings(query, params));
   }
   else
      await runQueryInternal(query);
};

const replaceBindings = (query: string, values: Record<string, string>) => {
   let finalQuery = query;
   Object.entries(values).forEach(([paramName, value]) => {
      finalQuery = finalQuery.replace(
         new RegExp(`:${paramName}\\b`, 'g'),
         value
      );
   });
   return finalQuery;
};

const killTabQuery = async () => {
   if (isCancelling.value) return;

   isCancelling.value = true;

   try {
      const params = {
         uid: props.connection.uid,
         tabUid: props.tab.uid
      };

      await Schema.killTabQuery(params);
   }
   catch (err) {
      addNotification({ status: 'error', message: err.stack });
   }

   isCancelling.value = false;
};

const setCancelButtonVisibility = (val: boolean) => {
   if (workspace.value.customizations.cancelQueries)
      showCancel.value = val;
};

const clearTabData = () => {
   results.value = [];
   resultsCount.value = 0;
   durationsCount.value = 0;
   affectedCount.value = null;
};

const resize = (e: MouseEvent) => {
   const el = queryEditor.value.$el;
   const queryFooterHeight = queryAreaFooter.value.clientHeight;
   const bottom = e.pageY || resizer.value.getBoundingClientRect().bottom;
   const maxHeight = window.innerHeight - 100 - queryFooterHeight - consoleHeight.value;
   let localEditorHeight = bottom - el.getBoundingClientRect().top;
   if (localEditorHeight > maxHeight) localEditorHeight = maxHeight;
   if (localEditorHeight < 50) localEditorHeight = 50;
   editorHeight.value = localEditorHeight;
};

const resizeResults = () => queryTable.value.resizeResults();

const onWindowResize = (e: MouseEvent) => {
   if (!queryEditor.value) return;
   const el = queryEditor.value.$el;
   const queryFooterHeight = queryAreaFooter.value.clientHeight;
   const bottom = e.pageY || resizer.value.getBoundingClientRect().bottom;
   const maxHeight = window.innerHeight - 100 - queryFooterHeight;
   const localEditorHeight = bottom - el.getBoundingClientRect().top;

   if (localEditorHeight > maxHeight)
      editorHeight.value = maxHeight;
};

const stopResize = () => {
   window.removeEventListener('mousemove', resize);
   if (queryTable.value && results.value.length)
      resizeResults();

   if (queryEditor.value)
      queryEditor.value.editor.resize();
};

const beautify = () => {
   if (queryEditor.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let language: any = 'sql';

      switch (workspace.value.client) {
         case 'mysql':
            language = 'mysql';
            break;
         case 'maria':
            language = 'mariadb';
            break;
         case 'pg':
            language = 'postgresql';
            break;
      }

      const formattedQuery = format(query.value, {
         language,
         uppercase: true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      queryEditor.value.editor.session.setValue(formattedQuery);
   }
};

const openHistoryModal = () => {
   isHistoryOpen.value = true;
};

const saveQuery = () => {
   addNote({
      uid: uidGen('N'),
      cUid: workspace.value.uid,
      type: 'query',
      date: new Date(),
      note: query.value,
      isArchived: false,
      title: queryName.value
   });
   isQuerySaved.value = true;
};

const openSavedModal = () => {
   showScratchpad('query');
};

const selectQuery = (sql: string) => {
   if (queryEditor.value)
      queryEditor.value.editor.session.setValue(sql);

   isHistoryOpen.value = false;
};

const clear = () => {
   if (queryEditor.value)
      queryEditor.value.editor.session.setValue('');
   clearTabData();
};

const downloadTable = (format: 'csv' | 'json' | 'sql' | 'php') => {
   queryTable.value.downloadTable(format, `${props.tab.type}-${props.tab.index}`);
};

const commitTab = async () => {
   isQuering.value = true;
   try {
      const params = {
         uid: props.connection.uid,
         tabUid: props.tab.uid
      };

      await Schema.commitTab(params);
      setUnsavedChanges({ uid: props.connection.uid, tUid: props.tabUid, isChanged: false });
      addNotification({ status: 'success', message: t('general.actionSuccessful', { action: 'COMMIT' }) });
   }
   catch (err) {
      addNotification({ status: 'error', message: err.stack });
   }

   isQuering.value = false;
};

const rollbackTab = async () => {
   isQuering.value = true;
   try {
      const params = {
         uid: props.connection.uid,
         tabUid: props.tab.uid
      };

      await Schema.rollbackTab(params);
      setUnsavedChanges({ uid: props.connection.uid, tUid: props.tabUid, isChanged: false });
      addNotification({ status: 'success', message: t('general.actionSuccessful', { action: 'ROLLBACK' }) });
   }
   catch (err) {
      addNotification({ status: 'error', message: err.stack });
   }

   isQuering.value = false;
};

defineExpose({ resizeResults });

query.value = props.tab.content as string;
queryName.value = props.tab.elementName as string;
filePath.value = props.tab.filePath as string;
selectedSchema.value = props.tab.schema || breadcrumbsSchema.value;

window.addEventListener('resize', onWindowResize);

const reloadListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen)
      runQuery(query.value);
};

const formatListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen)
      beautify();
};

const killQueryListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen)
      killTabQuery();
};

const clearQueryListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen)
      clear();
};

const historyListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen)
      openHistoryModal();
};

const openFileListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen)
      openFile();
};

const saveFileAsListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen)
      saveFileAs();
};

const saveContentListener = () => {
   const hasModalOpen = !!document.querySelectorAll('.modal.active').length;
   if (props.isSelected && !hasModalOpen && filePath)
      saveFile();
};

const openFile = async () => {
   const result = await Application.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'SQL', extensions: ['sql', 'txt'] }] });
   if (result && !result.canceled) {
      const file = result.filePaths[0];
      const content = await Application.readFile({ filePath: file, encoding: 'utf-8' });
      const fileName = file.split('/').pop().split('\\').pop();
      if (props.tab.filePath && props.tab.filePath !== file) {
         newTab({
            uid: props.connection.uid,
            type: 'query',
            filePath: file,
            content: '',
            schema: selectedSchema.value,
            elementName: fileName
         });
      }
      else {
         filePath.value = file;
         queryName.value = fileName;
         query.value = content;
         lastSavedQuery.value = content;
      }
   }
};

const saveFileAs = async () => {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const result: any = await Application.showSaveDialog({
      filters: [{ name: 'SQL', extensions: ['sql'] }],
      defaultPath: (queryName.value !== undefined && !queryName.value.includes('.sql') ? `${queryName.value}.sql` : queryName.value) || 'query.sql'
   });

   if (result && !result.canceled) {
      await Application.writeFile(result.filePath, query.value);
      addNotification({ status: 'success', message: t('general.actionSuccessful', { action: t('application.saveFile') }) });
      queryName.value = result.filePath.split('/').pop().split('\\').pop();
      filePath.value = result.filePath;
      lastSavedQuery.value = toRaw(query.value);
   }
};

const saveFile = async () => {
   if (filePath.value) {
      await Application.writeFile(filePath.value, query.value);
      addNotification({ status: 'success', message: t('general.actionSuccessful', { action: t('application.saveFile') }) });
      lastSavedQuery.value = toRaw(query.value);
   }
   else
      saveFileAs();
};

const loadFileContent = async (file: string) => {
   const content = await Application.readFile({ filePath: file, encoding: 'utf-8' });
   query.value = content;
   lastSavedQuery.value = content;
};

onMounted(() => {
   const localResizer = resizer.value;

   ipcRenderer.on('run-or-reload', reloadListener);
   ipcRenderer.on('format-query', formatListener);
   ipcRenderer.on('kill-query', killQueryListener);
   ipcRenderer.on('clear-query', clearQueryListener);
   ipcRenderer.on('query-history', historyListener);
   ipcRenderer.on('open-file', openFileListener);
   ipcRenderer.on('save-file-as', saveFileAsListener);
   ipcRenderer.on('save-content', saveContentListener);

   localResizer.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();

      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
   });

   if (props.tab.autorun)
      runQuery(query.value);

   if (props.tab.filePath)
      loadFileContent(props.tab.filePath);

   const debouncedSelection = debounce(() => {
      const selectedQuery = queryEditor.value.editor.getSelectedText();
      shouldShowBindingPanel(selectedQuery || query.value);
   }, 300);
   queryEditor.value.editor.selection.on('changeSelection', debouncedSelection);

   queryEditor.value.editor.container.addEventListener('contextmenu', (e) => {
      const InputMenu = Menu.buildFromTemplate([
         {
            label: t('general.run'),
            click: () => runQuery(query.value)
         },
         {
            label: t('general.clear'),
            click: () => clear()
         },
         {
            type: 'separator'
         },
         {
            label: t('application.saveFile'),
            click: () => saveFile()
         },
         {
            label: t('application.saveFileAs'),
            click: () => saveFileAs()
         },
         {
            label: t('application.openFile'),
            click: () => openFile()
         },
         {
            type: 'separator'
         },
         {
            label: t('general.cut'),
            role: 'cut'
         },
         {
            label: t('general.copy'),
            role: 'copy'
         },
         {
            label: t('general.paste'),
            role: 'paste'
         },
         {
            type: 'separator'
         },
         {
            label: t('general.selectAll'),
            role: 'selectAll'
         }
      ]);
      e.preventDefault();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let node: any = e.target;
      while (node) {
         if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
            InputMenu.popup({ window: getCurrentWindow() });
            break;
         }
         node = node.parentNode;
      }
   });
});

onBeforeUnmount(() => {
   window.removeEventListener('resize', onWindowResize);
   const params = {
      uid: props.connection.uid,
      tabUid: props.tab.uid
   };
   Schema.destroyConnectionToCommit(params);

   ipcRenderer.removeListener('run-or-reload', reloadListener);
   ipcRenderer.removeListener('format-query', formatListener);
   ipcRenderer.removeListener('kill-query', killQueryListener);
   ipcRenderer.removeListener('clear-query', clearQueryListener);
   ipcRenderer.removeListener('query-history', historyListener);
   ipcRenderer.removeListener('open-file', openFileListener);
   ipcRenderer.removeListener('save-file-as', saveFileAsListener);
   ipcRenderer.removeListener('save-content', saveContentListener);
});

</script>

<style lang="scss">
.workspace-tabs {
   align-content: baseline;

   .workspace-query-runner {
      position: relative;
      border-bottom: 1px solid $bg-color-gray;

      .workspace-query-runner-inner {
         position: relative;
         display: flex;
         flex-direction: row;
      }

      .query-area-resizer {
         height: 4px;
         margin-top: -4px;
         width: 100%;
         cursor: ns-resize;
         z-index: 99;
         transition: background 0.2s;
         position: sticky;

         &:hover {
            background: var(--primary-color-dark);
         }
      }

      .workspace-query-runner-footer {
         display: flex;
         flex-wrap: wrap;
         row-gap: 0.4rem;
         justify-content: space-between;
         padding: 0.3rem 0.6rem 0.4rem;
         align-items: center;
         min-height: 42px;
         border-top: 1px solid $bg-color-gray;

         .workspace-query-buttons,
         .workspace-query-info {
            display: flex;
            align-items: center;

            .btn {
               display: flex;
               align-self: center;
               margin-right: 0.4rem;
            }
         }

         .workspace-query-info {
            overflow: visible;

        > div + div {
               padding-left: 0.6rem;
            }
         }
      }
   }

   .workspace-query-results {
      min-height: 200px;
   }
}
</style>

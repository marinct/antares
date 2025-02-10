<template>
   <div v-if="props.parameters.length" class="query-binding-panel">
      <div class="panel-header">
         <div class="d-flex">
            <BaseIcon
               icon-name="mdiPlay"
               class="mr-1"
               :size="24"
            />
            <span class="cut-text">{{ t('database.bindingVariables') }}</span>
         </div>
      </div>
      <div class="panel-body">
         <form class="form-horizontal">
            <div
               v-for="param in props.parameters"
               :key="param.name"
               class="form-group"
            >
               <div class="">
                  <label class="form-label">
                     <span>{{ param.name }}</span>
                     <span class="form-label-hint">{{ param.column }}</span>
                  </label>
               </div>
               <div class="">
                  <div class="input-group">
                     <input
                        v-model="values[param.name]"
                        class="form-input"
                        type="text"
                        :class="{ 'type-null': isNull(values[param.name]) }"
                        placeholder="<null>"
                     >
                  </div>
               </div>
            </div>
         </form>
      </div>
   </div>
</template>

<script setup lang="ts">
import { FLOAT, NUMBER } from 'common/fieldTypes';
import { debounce } from 'lodash';
import { PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseIcon from '@/components/BaseIcon.vue';

interface BindingParameter {
   name: string;
   column: string;
   type?: string;
   value?: string;
}

const { t } = useI18n();

const props = defineProps({
   parameters: {
      type: Array as PropType<BindingParameter[]>,
      required: true
   },
   client: {
      type: String,
      required: true
   }
});

const emit = defineEmits<{(e: 'change', event: { rawValues: Record<string, string>; values: Record<string, string> }): void}>();

const values = ref<Record<string, string>>({});

const isNull = (value: string) => {
   return ['<null>', 'NULL', 'null'].indexOf(value) !== -1;
};

const formatValue = (value: string, type?: string) => {
   if (!value || value === 'NULL') return 'NULL';

   value = value.indexOf(',') !== -1 ? value.split(',').filter(v => v.trim()).map(val => val.trim()).join(',') : value;

   let qc;
   switch (props.client) {
      case 'maria':
      case 'mysql':
         qc = '"';
         break;
      case 'pg':
         qc = '\'';
         break;
      default:
         qc = '"';
   }

   return [...NUMBER, ...FLOAT].includes(type) ? value : `${qc}${value.replace(new RegExp(qc, 'g'), qc + qc)}${qc}`;
};

const emitChange = debounce((newValues: Record<string, string>) => {
   const rawValues = { ...newValues };
   const formattedValues: Record<string, string> = {};

   props.parameters.forEach(param => {
      formattedValues[param.name] = formatValue(newValues[param.name], param.type);
   });
   emit('change', { rawValues, values: formattedValues });
}, 300);

// Watch for changes in values and emit them immediately
watch(values, (newValues) => {
   emitChange(newValues);
}, { deep: true });

// Initialize values from parameters
props.parameters.forEach(param => {
   values.value[param.name] = param.value || '';
});
</script>

<style lang="scss">
.query-binding-panel {
   width: 300px;
   background: $bg-color-dark;
   border-left: 1px solid $bg-color-gray;
   display: flex;
   flex-direction: column;

   .panel-header {
      padding: 1rem;
      border-bottom: 1px solid $bg-color-gray;
      // box-shadow: 0px 2px 2px 0px #181818;
   }

   .panel-body {
      flex: 1;
      padding: 0.5rem 1rem;
      overflow-y: auto;
   }

   .panel-footer {
      padding: 1rem;
      border-top: 1px solid $bg-color-gray;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
   }

   .form-group {
      margin-bottom: 1rem;
   }

   .form-label-hint {
      color: #666;
      font-size: 0.8em;
      margin-left: 0.5rem;
   }
}
</style>

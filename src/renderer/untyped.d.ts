/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
declare module '@/App.vue';
declare module 'v-mask';
declare module 'json2php';
declare module '*/encoding_charset.js';
declare module 'vuedraggable' {// <- to export as default
  const draggableComponent: import('vue').DefineComponent<{
    list: {
      type: ArrayConstructor;
      required: boolean;
      default: any;
    };
    modelValue: {
      type: ArrayConstructor;
      required: boolean;
      default: any;
    };
    itemKey: {
      type: (FunctionConstructor | StringConstructor)[];
      required: boolean;
    };
    clone: {
      type: FunctionConstructor;
      default: (original: any) => any;
    };
    tag: {
      type: StringConstructor;
      default: string;
    };
    move: {
      type: FunctionConstructor;
      default: any;
    };
    componentData: {
      type: ObjectConstructor;
      required: boolean;
      default: any;
    };
  }, unknown, {
    error: boolean;
  }, {
    realList(): any;
    getKey(): any;
  }, {
    getUnderlyingVm(domElement: any): any;
    getUnderlyingPotencialDraggableComponent(htmElement: any): any;
    emitChanges(evt: any): void;
    alterList(onList: any): void;
    spliceList(): void;
    updatePosition(oldIndex: any, newIndex: any): void;
    getRelatedContextFromMoveEvent({ to, related }: {
      to: any;
      related: any;
    }): any;
    getVmIndexFromDomIndex(domIndex: any): any;
    onDragStart(evt: any): void;
    onDragAdd(evt: any): void;
    onDragRemove(evt: any): void;
    onDragUpdate(evt: any): void;
    computeFutureIndex(relatedContext: any, evt: any): any;
    onDragMove(evt: any, originalEvent: any): any;
    onDragEnd(): void;
  }, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, any[], any, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
    move: Function;
    tag: string;
    clone: Function;
    list: unknown[];
    modelValue: unknown[];
    componentData: Record<string, any>;
  } & {
    itemKey?: string | Function;
  }>, {
    move: Function;
    tag: string;
    clone: Function;
    list: unknown[];
    modelValue: unknown[];
    componentData: Record<string, any>;
  }>;
  export = draggableComponent;
}

declare const SvgIcon: import('vue').DefineComponent<{
  type: {
    type: StringConstructor;
    default: string;
  };
  path: {
    type: StringConstructor;
    default: string;
  };
  size: {
    type: NumberConstructor;
    optional: boolean;
  };
  viewbox: {
    type: StringConstructor;
    optional: boolean;
  };
  flip: {
    type: StringConstructor;
    optional: boolean;
  };
  rotate: {
    type: NumberConstructor;
    optional: boolean;
  };
}>;

declare module '@jamescoyle/vue-icon' {
  export default SvgIcon;
}

import { defineComponent, Transition } from 'vue';

export default defineComponent({
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => (
      <Transition
        duration={300}
        enterActiveClass="transition-opacity transition-300 transition-ease"
        leaveActiveClass="transition-opacity transition-300 transition-ease"
        enterFromClass="op-0!"
        leaveToClass="op-0!"
      >
        {props.show && (
          <div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex flex-col justify-end items-center">
            <div class="w-full max-w-200 p-6 pb-10 flex flex-col gap-3 items-center">
              {props.title && <div class="text-white text-lg op-80">{props.title}</div>}
              {slots.default?.()}
            </div>
          </div>
        )}
      </Transition>
    );
  },
});

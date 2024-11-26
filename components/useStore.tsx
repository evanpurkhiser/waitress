import {create} from 'zustand';
import {useShallow} from 'zustand/shallow';

interface Store {
  filter: string;
  setFilter: (value: string) => void;
}

const useStore = create<Store>()(set => ({
  filter: '',
  setFilter: value => set({filter: value}),
}));

function reduceFilterState(state: Store) {
  return [state.filter, state.setFilter] as const;
}

function useFilter() {
  return useStore(useShallow(reduceFilterState));
}

export {useFilter, useStore};

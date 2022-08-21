import create from 'zustand';
import shallow from 'zustand/shallow';

type Store = {
  filter: string;
  setFilter: (value: string) => void;
};

const useStore = create<Store>()(set => ({
  filter: '',
  setFilter: value => set({filter: value}),
}));

const useFilter = () =>
  useStore(state => [state.filter, state.setFilter] as const, shallow);

export {useFilter, useStore};

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  selectedPlayerId: string;
  selectedGameType: string;
  selectedTournamentType: string;
}

const initialState: UiState = {
  selectedPlayerId: 'player-1',
  selectedGameType: '',
  selectedTournamentType: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedPlayer: (state, action: PayloadAction<string>) => {
      state.selectedPlayerId = action.payload;
    },
    setSelectedGameType: (state, action: PayloadAction<string>) => {
      state.selectedGameType = action.payload;
    },
    setSelectedTournamentType: (state, action: PayloadAction<string>) => {
      state.selectedTournamentType = action.payload;
    },
  },
});

export const { setSelectedPlayer, setSelectedGameType, setSelectedTournamentType } = uiSlice.actions;
export default uiSlice.reducer;

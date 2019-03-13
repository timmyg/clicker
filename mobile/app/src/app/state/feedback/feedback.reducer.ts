// import * as fromProgram from './program.actions';
// import { Program } from './program.model';

// export interface State {
//   programs: Program[];
//   loading: boolean;
//   error: string;
// }

// export const initialState: State = {
//   programs: [],
//   loading: false,
//   error: '',
// };

// export function reducer(state = initialState, action: fromProgram.ProgramActions): State {
//   switch (action.type) {
//     case fromProgram.GET_PROGRAMS: {
//       return {
//         ...state,
//         loading: true,
//       };
//     }

//     case fromProgram.GET_PROGRAMS_SUCCESS: {
//       return {
//         ...state,
//         loading: false,
//         programs: action.payload,
//       };
//     }

//     case fromProgram.GET_PROGRAMS_FAIL: {
//       return {
//         ...state,
//         loading: false,
//         error: 'error loading programs',
//       };
//     }

//     default: {
//       return state;
//     }
//   }
// }

// export const getAllPrograms = (state: State) => state.programs;
// export const getLoading = (state: State) => state.loading;
// export const getError = (state: State) => state.error;

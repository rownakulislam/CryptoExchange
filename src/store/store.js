import { configureStore } from '@reduxjs/toolkit'
import {legacy_createStore as createStore,combineReducers, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';


import {provider,tokens} from './reducers'

const reducer =combineReducers ({
    provider,
    tokens
})

const initialState={}
const middleware =[thunk]
const store =createStore(reducer,initialState,composeWithDevTools(applyMiddleware(...middleware)))






// const store =configureStore({
//     reducer:{
//         provider: provider
//     }
// })


export default store;
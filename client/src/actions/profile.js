import axios from 'axios';
import {setAlert} from './alert';

import{
    GET_PROFILE,
    PROFILE_ERROR
}from './types';


//Get current users profile
export const getCurrentProfile =()=>async dispatch => {     //is called as soon as we go to the dashboard
   try {
       const res=await axios.get('/api/profile/me');
       dispatch({
           type:GET_PROFILE,
           payload:res.data
       });
   } catch (err) {
       dispatch({
           type: PROFILE_ERROR,
           payload:{msg:err.response.statusText,status:err.response.status}
       });
   } 
};
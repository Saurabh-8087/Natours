/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const singup = async(name,email, password, passwordConfirm)=>{
   try {
    const res= await axios({
      method:'POST',
      // url:'http://127.0.0.1:3000/api/v1/users/signup',
      url:`http://${window.location.hostname}:3000/api/v1/users/signup`,
      data:{
        name,
        email,
        password,
        passwordConfirm
      }
    });

    if(res.data.status ==='success'){
      showAlert('success','Logged in successfully!');
      window.setTimeout(()=>{ 
        location.assign('/');
      }, 1500);
    }
    console.log(res);
   } catch (error) {
    showAlert('error',error.response.data.message);
   }
};


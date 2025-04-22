/*eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import {login, logout} from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { singup } from './singup';

const mapBox= document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const singupForm = document.querySelector('.form--singup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataform = document.querySelector('.form-user-data');
const userPasswordform = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour') ;


if(mapBox){
const locations = JSON.parse(mapBox.dataset.locations);
displayMap(locations);
}

if(loginForm)
loginForm.addEventListener('submit', e=>{
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});


if(singupForm)
  singupForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    singup(name,email, password, passwordConfirm);
  });

if(logOutBtn) logOutBtn.addEventListener('click', logout);

if(userDataform)
  userDataform.addEventListener('submit',async e=>{
      e.preventDefault();
      const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

       

      await updateSettings(form, 'data');
});

if(userPasswordform)
  userPasswordform.addEventListener('submit',async e=>{
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...'


      const passwordCurrent  = document.getElementById('password-current').value; 
      const password = document.getElementById('password').value; 
      const passwordConfirm = document.getElementById('password-confirm').value; 

      await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');


      document.querySelector('.btn--save-password').textContent = 'Save Password';
      document.getElementById('password-current').value ='';
      document.getElementById('password').value='';
      document.getElementById('password-confirm').value='';
});


if(bookBtn)
    bookBtn.addEventListener('click', e=>{
      e.target.textContent ='Processing...';
      const {tourId} = e.target.dataset;
      bookTour(tourId);
  });

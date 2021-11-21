import React, { createRef, useContext, useState } from 'react';
import '../scss/AuthPage.scss';
import name from '../assets/name.png';
import email from '../assets/email.png';
import password from '../assets/password.png';
import { AUTHCONTEXT } from '../App';
import pic from '../assets/avatar.jpg';
import authManager from '../utils/auth';

const AuthPage=()=>{

    let [loginView,setLoginView]=useState(true);
    let authContext=useContext(AUTHCONTEXT);

    let signinEmail=createRef<HTMLInputElement>();
    let signinPassword=createRef<HTMLInputElement>();

    let signupPic=createRef<HTMLImageElement>();
    let signupPicInput=createRef<HTMLInputElement>();
    let signupName=createRef<HTMLInputElement>();
    let signupEmail=createRef<HTMLInputElement>();
    let signupPassword=createRef<HTMLInputElement>();

    let signIn=()=>{
        if(signinEmail.current?.value.trim()==="") return;
        if(signinPassword.current?.value.trim()==="") return;
        if(signinEmail.current?.checkValidity() && signinPassword.current?.checkValidity()){
            authManager.signIn({
                setLoadingView:authContext?.setLoadingView,
                dispatch:authContext?.authDispatch,
                email:signinEmail.current.value,
                password:signinPassword.current.value,
                setLoggedIn:authContext?.setLoggedIn
            });
        }else{
            alert("Please Fill Up Details Correctly!");
        }
    };

    let signUp=()=>{
        if(signupName.current?.value.trim()==="") return;
        if(signupEmail.current?.value.trim()==="") return;
        if(signupPassword.current?.value.trim()==="") return;
        if(signupEmail.current?.checkValidity() && signupName.current?.checkValidity() && signupPassword.current?.checkValidity){
            authManager.signUp({
                setLoadingView:authContext?.setLoadingView,
                setLoggedIn:authContext?.setLoggedIn,
                dispatch:authContext?.authDispatch,
                email:signupEmail.current.value,
                name:signupName.current.value,
                password:signupPassword.current.value,
                pic:(signupPicInput.current && signupPicInput.current.files && signupPicInput.current.files.length>0)?signupPicInput.current?.files[0]:null
            });
        }else{
            alert("Please Fill Up Details Correctly!");
        }
    }

    return (
        <main className="AuthPage" >
            <aside className={loginView?"aside-login":"aside-signup"}>
                {loginView?<div>
                    <h2>Hello Friend</h2>
                    <p>Create an account and start exploring the world making friends.</p>
                    <button onClick={()=>setLoginView(!loginView)}>SIGN UP</button>
                </div>:
                <div>
                    <h2>Welcome Back</h2>
                    <p>To keep connected with us, Please signin with your email.</p>
                    <button onClick={()=>setLoginView(!loginView)}>SIGN IN</button>
                </div>}
            </aside>
            <section className={loginView?"section-login":"section-signup"}>
                {loginView?<>
                    <h1>Welcome Back!</h1>
                    <div className="input-box">
                        <img src={email}/>
                        <input type="email" placeholder="Email" ref={signinEmail} minLength={2}/>
                    </div>
                    <div className="input-box">
                        <img src={password}/>
                        <input type="password" placeholder="Password" ref={signinPassword} minLength={5}/>
                    </div>
                    <button onClick={()=>signIn()}>Signin</button>
                </>:<>
                    <h1>Signup to socialpic</h1>
                    <figure onClick={()=>signupPicInput.current?.click()}>
                        <img src={pic} alt="user-pic" ref={signupPic}/>
                        <input type="file" style={{display:"none"}} ref={signupPicInput} onChange={(e)=>{
                            if(e.target.files && e.target.files.length!>0){
                                let url=URL.createObjectURL(e.target.files[0]);
                                if(signupPic.current)
                                    signupPic.current.src=url;
                                setTimeout(()=>{
                                    URL.revokeObjectURL(url);
                                },1500);
                            }
                        }}/>
                    </figure>
                    <div className="input-box">
                        <img src={name}/>
                        <input type="text" placeholder="Name" ref={signupName} minLength={3}/>
                    </div>
                    <div className="input-box">
                        <img src={email}/>
                        <input type="email" placeholder="Email" ref={signupEmail} minLength={2}/>
                    </div>
                    <div className="input-box">
                        <img src={password}/>
                        <input type="password" placeholder="Password" ref={signupPassword} minLength={5}/>
                    </div>
                    <button onClick={()=>signUp()}>Signup</button>
                </>}
            </section>
            <h1>socialpic</h1>
            {!loginView?<p onClick={()=>setLoginView(!loginView)}>already an user signin</p>
            :<p onClick={()=>setLoginView(!loginView)}>for account creation signup</p>}
        </main>
    );
}

export default AuthPage;
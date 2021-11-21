import React, { useContext, useState } from 'react';
import '../scss/Navbar.scss';
import SearchPic from '../assets/search.png';
import HomePic from '../assets/home.png';
import savedPic from '../assets/bookmark.png';
import userPic from '../assets/userpic.jpg';
import { AUTHCONTEXT } from '../App';
import { useHistory } from 'react-router';
import user from '../assets/avatar.jpg';
import TestPic from '../assets/2.jpg';
import arrow from '../assets/next.png';
import authManager from '../utils/auth';

const Navbar = () => {

    let [open,setOpen]=useState(false);
    let authContext=useContext(AUTHCONTEXT);
    let history=useHistory();

    // Search Control
    let [showSearchView,setSearchView]=useState<boolean>(false);
    let [searchData,setSearchData]=useState<{
        pic:string,
        name:string,
        _id:string
    }[]>([]);

    let searchTimeOut:any=null;
    let search=(keyword:string)=>{
        if(searchTimeOut){
            clearTimeout(searchTimeOut);
        }
        searchTimeOut=setTimeout(()=>{
            clearTimeout(searchTimeOut);
            if(keyword.trim()!==""){
                authManager.searchUsers({
                    searchField:keyword.toLowerCase(),
                    setSearchData:setSearchData,
                    authState:authContext?.authState
                });
            }
        },850);
    }

    return (
        <nav>
            <h1 onClick={()=>history.push("/")}>socialpic</h1>
            {authContext?.loggedIn?<><div className="search-box">
                <img src={SearchPic} alt={"SearchPic"}/>
                <input type="text" placeholder="Search for users" onClick={()=>setSearchView(!showSearchView)} onChange={(e)=>search(e.target.value)}/>
            </div>
            <div className="menu">
                <p title="Home" onClick={()=>history.push("/")}><img src={HomePic}/></p>
                <p title="Saved" onClick={()=>history.push("/saved")}><img src={savedPic}/></p>
                <img src={`http://localhost:3000/fetcher/getProfilePic?pic=${authContext?.authState.pic}`} alt="user-pic" onClick={()=>{
                    setOpen(!open);
                    setTimeout(()=>{
                        setOpen(false);
                    },3000);
                }}/>
            </div></>:<button className="landing_btn" onClick={()=>history.push("/auth")}>
                    Login
                </button>}
            {open?<div className="menu-window context-menu">
                <p onClick={()=>{
                    history.push("/profile",{
                        id:authContext?.authState._id
                    });
                    // setOpen(false);
                }}><i className="fa fa-user" aria-hidden="true"></i> My Profile</p>
                <p onClick={()=>{
                    authContext?.setEditProfileView({
                        show:true,
                        editProfileView:true,
                        postEditView:false,
                        post:null
                    });
                }}><i className="fa fa-cog" aria-hidden="true"></i> Edit Profile</p>
                <p className="danger" onClick={()=>{
                    localStorage.removeItem("--login-details");
                    authContext?.authDispatch({
                        type:"LOGOUT",
                        payload:{}
                    });
                    setTimeout(()=>{
                        history.push("/");
                        authContext?.setLoggedIn(false);
                    },1000);
                }}><i className="fa fa-sign-out" aria-hidden="true"></i> Logout</p>
            </div>:null}

            {showSearchView?<div className="User-search-view">
                <ul>
                    {searchData.length===0?<h1>Search Something!</h1>:null}
                    {searchData.map(data=>{
                        if(data._id!=authContext?.authState._id){
                            return <li key={data._id} onClick={()=>{
                                history.push("/profile",{
                                    id:data._id
                                });
                                setSearchView(false);
                            }}><img src={`http://localhost:3000/fetcher/getProfilePic?pic=${data.pic}`}/> <p>{data.name}</p> <img src={arrow}/></li>;
                        }
                    })}
                </ul>
            </div>:null}
        </nav>
    );
};

export default Navbar;
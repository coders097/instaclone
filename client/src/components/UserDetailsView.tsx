import React, { createRef, useContext, useEffect, useState } from 'react';
import '../scss/UserDetailsView.scss';
import Pic from '../assets/userpic.jpg';
import authManager from '../utils/auth';
import connectionManager from '../utils/connection';
import Avatar from '../assets/avatar.jpg';
import EditingPic from '../assets/editing.png';
import { AUTHCONTEXT, POSTCONTEXT } from '../App';

const UserDetailsView=({id,postsNumber}:{id:string | null | undefined,postsNumber:number | undefined})=>{

    let authContext=useContext(AUTHCONTEXT);
    let postContext=useContext(POSTCONTEXT);
    let userPic=createRef<HTMLInputElement>();
    let mainPicRef=createRef<HTMLImageElement>();
    let [data,setData]=useState<{
        details: string,
        email: string,
        name: string,
        pic: string,
        _id: string,
        followers: number,
        following:number
    }>({
        details: "",
        email:"",
        name: "",
        pic: "",
        _id: "",
        followers: 0,
        following: 0
    });

    useEffect(()=>{
        if(id){
            authManager.getDetailsOfParticularUser({
                authState:authContext?.authState,
                id:id,
                setLoadingView:authContext?.setLoadingView,
                setData:setData
            });
        }
    },[id]);

    return (
        <section className="UserDtailsView">
            <div className="header">
                {data._id==authContext?.authState._id?<img src={`http://localhost:3000/fetcher/getProfilePic?pic=${authContext.authState.pic}`} ref={mainPicRef} 
                onError={()=>{
                    if(mainPicRef.current) mainPicRef.current.src=Avatar;
                }}/>
                :<img src={`http://localhost:3000/fetcher/getProfilePic?pic=${data.pic}`} ref={mainPicRef} 
                onError={()=>{
                    if(mainPicRef.current) mainPicRef.current.src=Avatar;
                }}/>}
                <div className="user-details">
                    <h2>{data.name} &nbsp;{authContext?.authState._id==data._id?<span><img src={EditingPic} onClick={()=>authContext?.setEditProfileView({
                        show:true,
                        editProfileView:true,
                        postEditView:false,
                        post:null
                    })}/></span>:null}</h2>
                    <ul>
                        <li><span>{postsNumber}</span> posts</li>
                        <li><span>{data.followers}</span> followers</li>
                        <li><span>{data.following}</span> following</li>
                    </ul>
                    <h3 className="about">
                        {data.details}
                    </h3>
                    {(id && authContext?.authState._id!==data._id)?
                        (authContext?.followingMap.has(id))?<button className="btn" onClick={()=>connectionManager.unfollow({
                            setLoadingView:authContext?.setLoadingView,
                            authState:authContext?.authState,
                            id:id,
                            setFollowingMap:authContext?.setFollowingMap,
                            followingMap:authContext?.followingMap,
                            data:data,
                            setData:setData
                        })}>Unfollow</button>
                        :<button className="btn" onClick={()=>connectionManager.follow({
                            setLoadingView:authContext?.setLoadingView,
                            authState:authContext?.authState,
                            id:id,
                            setFollowingMap:authContext?.setFollowingMap,
                            followingMap:authContext?.followingMap,
                            data:data,
                            setData:setData
                        })}>Follow</button>
                    :null}
                    <input type="file" ref={userPic} style={{display:"none"}} onChange={(e)=>{
                        let file=null;
                        if(e.target.files && (e.target.files.length>0)){
                            file=e.target.files[0];
                        }
                        if(!file && (authContext?.authState.pic==="avatar.jpg")){
                            return;
                        }
                        authManager.changeProfilePic({
                            setLoadingView:authContext?.setLoadingView,
                            authDispatch:authContext?.authDispatch,
                            authState:authContext?.authState,
                            file:file,
                            allPosts:postContext?.allPosts
                        });
                    }}/>
                    {(id==authContext?.authState._id)?<button className="btn" onClick={()=>userPic.current?.click()}>Change Pic</button>:null}
                </div>
            </div>
            <hr></hr>
        </section>
    );
}

export default UserDetailsView;
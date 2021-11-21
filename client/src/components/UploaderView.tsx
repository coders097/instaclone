import React, { createRef, useContext, useState } from 'react';
import '../scss/UploaderView.scss';
import Pic from '../assets/userpic.jpg';
import PhotosPic from '../assets/photos.png';
import postManager from '../utils/post';
import { AUTHCONTEXT, POSTCONTEXT } from '../App';
import { useHistory } from 'react-router';

const UploaderView = () => {


    let [file,setFile]=useState<File | null>(null);
    let inputRef=createRef<HTMLInputElement>();
    let message=createRef<HTMLTextAreaElement>();
    let authContext=useContext(AUTHCONTEXT);
    let postContext=useContext(POSTCONTEXT);
    let history=useHistory();

    let clearUpload=()=>{
        setFile(null);
        if(message.current) message.current.innerText="";
    }

    let upload=()=>{
        if(!file && message.current?.value.trim()==="") {
            alert("Nothing To Post!");
            return;
        }
        postManager.addPost({
            file:file,
            message:message.current?.value.trim(),
            authState:authContext?.authState,
            setLoadingView:authContext?.setLoadingView,
            clearUpload:clearUpload,
            setAllDispatch:postContext?.setAllDispatch,
            posts:postContext?.allPosts,
            cacheParticularUserPosts:postContext?.cacheParticularUserPosts
        });
    }

    return (
        <section className="UploaderView">
            <div className="header">
                <img onClick={()=>{
                    history.push("/profile",{
                        id:authContext?.authState._id
                    });
                }} src={`http://localhost:3000/fetcher/getProfilePic?pic=${authContext?.authState.pic}`} alt="user-pic"/>
                <h2 onClick={()=>{
                    history.push("/profile",{
                        id:authContext?.authState._id
                    });
                }}>{authContext?.authState.name}</h2>
            </div>
            <textarea rows={4} placeholder={`What's on your mind, ${authContext?.authState.name.split(" ")[0]}?`} ref={message}/>
            <hr></hr>
            <div className="footer">
                <button onClick={()=>upload()}>Post</button>
                <input type="file" style={{display:"none"}} ref={inputRef} onChange={(e)=>(e.target.files && e.target.files[0])?setFile(e.target.files[0]):setFile(null)}/>
                <img src={PhotosPic} onClick={()=>inputRef.current?.click()}/>
                <p onClick={()=>inputRef.current?.click()}>Photo / Video</p>
                {file?<><h6 title={file?.name}>{file?.name}</h6>
                <span onClick={()=>setFile(null)}><i className="fa fa-times" aria-hidden="true"></i></span></>:null}
            </div>
        </section>
    );
};

export default UploaderView;
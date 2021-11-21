import React, { createRef, useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../scss/EditProfile.scss';
import Edit from '../assets/editing.png';
import { AUTHCONTEXT, POSTCONTEXT } from '../App';
import postManager from '../utils/post';
import LinkPic from '../assets/link.png';
import authManager from '../utils/auth';

const EditProfile=()=>{

    let nameEditProfile=createRef<HTMLInputElement>();
    let emailEditProfile=createRef<HTMLInputElement>();
    let passwordEditProfile=createRef<HTMLInputElement>();
    let detailsEditProfile=createRef<HTMLTextAreaElement>();


    let authContext=useContext(AUTHCONTEXT);
    let postContext=useContext(POSTCONTEXT);
    let [showEditPost,setShowEditPost]=useState(false);
    let linkCopyValue=createRef<HTMLParagraphElement>();
    let postInputField=createRef<HTMLInputElement>();
    let postTextInputField=createRef<HTMLInputElement>();
    let [userPostEditCheck,setUserPostEditCheck]=useState<{
        type:string,
        url:string
    } | null>(null);
    useEffect(()=>{
        if(authContext?.editProfileView.show){
            document.getElementById("pop-up-edit")!.style.display="unset";
        }else{
            document.getElementById("pop-up-edit")!.style.display="none";
        }
    },[authContext,authContext?.editProfileView.show]);

    let closeThisView=()=>{
        authContext?.setEditProfileView({
            show:false,
            editProfileView:false,
            postEditView:false,
            post:null
        });
        setShowEditPost(false);
        setUserPostEditCheck(null);
    }

    let editPost=()=>{
        if(userPostEditCheck){
            let contentType="";
            if(userPostEditCheck?.type==="message"){
                contentType='MESSAGE';
            }else if(userPostEditCheck?.type==='image'){
                contentType="PIC";
            }else contentType="VIDEO";
            console.log(contentType);
            postManager.editPost({
                _id:authContext?.editProfileView.post?._id as string,
                authState:authContext?.authState,
                contentType:contentType,
                file:contentType!=="MESSAGE"?postInputField.current?.files![0] as File:null,
                message:postTextInputField.current?.value,
                setAllDispatch:postContext?.setAllDispatch,
                setLoadingView:authContext?.setLoadingView,
                allPosts: postContext?.allPosts,
                closeThisView:closeThisView,
                savedPosts:postContext?.savedPosts,
                cacheParticularUserPosts:postContext?.cacheParticularUserPosts
            });
        }else alert("Nothing To Save!");
    }
    // useEffect(()=>{
    //     if(userPostEditCheck)
    //     if(postInputField.current && postInputField.current.files)
    //         console.log(postInputField.current.files[0].type);
    // },[userPostEditCheck]);

    return ReactDOM.createPortal(<>
        <p onClick={()=>{
            authContext?.setEditProfileView({
            show:false,
            editProfileView:false,
            postEditView:false,
            externalLinkView:false,
            post:null
        });
        setShowEditPost(false);
        setUserPostEditCheck(null);
        }}><i className="fa fa-times" aria-hidden="true"></i></p>
        {authContext?.editProfileView.editProfileView?<div className="EditProfile">
            <h1><img src={Edit}/> Edit Profile</h1>
            <hr></hr>
            <p>Name</p>
            <input type="text" ref={nameEditProfile} defaultValue={authContext.authState.name as string}/>
            <p>Email</p>
            <input type="email" ref={emailEditProfile} defaultValue={authContext.authState.email as string}/>
            <p>Password</p>
            <input type="password" ref={passwordEditProfile}/>
            <p>Details</p>
            <textarea rows={4} ref={detailsEditProfile} defaultValue={authContext.authState.details as string}/>
            <div>
                <button onClick={()=>closeThisView()}>CANCEL</button>
                <button onClick={()=>{
                    authManager.updateProfile({
                        authState:authContext?.authState,
                        authDispatch:authContext?.authDispatch,
                        setLoadingView:authContext?.setLoadingView,
                        name:nameEditProfile.current?.value,
                        email:emailEditProfile.current?.value,
                        password:passwordEditProfile.current?.value,
                        details:detailsEditProfile.current?.value,
                        closeThisView:closeThisView
                    });
                }}>SAVE</button>
            </div>
        </div>:null}

        {authContext?.editProfileView.postEditView?<div className="PostContextMenu">
            <p onClick={()=>{
                authContext?.setEditProfileView({
                    show:true,
                    editProfileView:false,
                    post:authContext.editProfileView.post,
                    postEditView:false
                });
                setShowEditPost(true);
            }}>Edit Post</p>
            <hr/>
            <p onClick={()=>{
                postManager.deletePost({
                    _id:authContext?.editProfileView.post?._id as string,
                    allPosts:postContext?.allPosts,
                    authState:authContext?.authState,
                    closeThisView:closeThisView,
                    setAllDispatch:postContext?.setAllDispatch,
                    setLoadingView:authContext?.setLoadingView,
                    savedPosts:postContext?.savedPosts,
                    cacheParticularUserPosts:postContext?.cacheParticularUserPosts
                });
            }}>Delete Post</p>
        </div>:null}

        {showEditPost?<div className="PostEditView">
            <div className="display">
                {userPostEditCheck?<>
                    {/* image/jpeg video/mp4 */}
                    {userPostEditCheck.type==='image'?
                    <img src={userPostEditCheck.url}/>:null}
                    {userPostEditCheck.type==='video'?
                    <video src={userPostEditCheck.url} controls={true}/>:null}
                </>:<>
                    {authContext?.editProfileView.post?.contentType==="PIC"?
                        <img src={`http://localhost:3000/fetcher/getPostPic?pic=${authContext?.editProfileView.post?.content}&token=${authContext?.authState.token}`}/>
                        :null
                    }
                    {authContext?.editProfileView.post?.contentType==="VIDEO"?
                        <video controls={true} src={`http://localhost:3000/fetcher/getPostVideo?token=${authContext?.authState.token}&name=${authContext?.editProfileView.post?.content}`}/>
                        :null
                    }
                </>}
            </div>
            <input type="file" style={{display:"none"}} ref={postInputField} onChange={(e)=>{
                if(e.target.files![0]) {
                    let url=URL.createObjectURL(e.target.files![0]);
                    setUserPostEditCheck({type:e.target.files![0].type.split('/')[0],url:url});
                }else {
                    console.log("reset!");
                    setUserPostEditCheck({type:"message",url:""});
                }
            }}/>
            <input type="text"
                ref={postTextInputField} 
                placeholder="Enter Caption Here!" 
                onClick={()=>(userPostEditCheck)?"":setUserPostEditCheck({type:"message",url:""})}
                defaultValue={authContext?authContext?.editProfileView.post?.message as string:"" }/>
            <div className="hori">
                <button onClick={()=>editPost()}>SAVE</button>
                <button onClick={()=>postInputField.current?.click()}>Change</button>
                <button style={{marginLeft:"auto",background:"rgb(255, 83, 83)"}} onClick={()=>{
                    authContext?.setEditProfileView({
                    show:false,
                    editProfileView:false,
                    postEditView:false,
                    post:null
                });
                setShowEditPost(false);
                setUserPostEditCheck(null);
                }}>CANCEL</button>
            </div>
        </div>:null}

        {authContext?.editProfileView.externalLinkView?<div className="ExternalLinkView">
            <p ref={linkCopyValue}>http://localhost:3001/external?id={authContext.editProfileView.post?._id}</p>
            <img src={LinkPic} onClick={()=>{
                navigator.clipboard.writeText(linkCopyValue.current?.innerText as string);
            }}/>
        </div>:null}

    </>,document.getElementById("pop-up-edit") as HTMLElement);
}

export default EditProfile;
import React, { createRef, useContext, useEffect, useState } from 'react';
import '../scss/Post.scss';
import UserPic from '../assets/userpic.jpg';
import Dots from '../assets/dots.png';
import Avatar from '../assets/avatar.jpg';
import Expand from '../assets/expand.png';
import HeartNo from '../assets/noheart.png';
import HeartYes from '../assets/heart.png';
import Save from '../assets/bookmark.png';
import Saved from '../assets/bookmarked.png';
import Comment from '../assets/comment.png';
import Share from '../assets/share.png';
import Send from '../assets/send.png';
import { PostState } from '../state/postState';
import { AUTHCONTEXT, COMMENTCONTEXT, POSTCONTEXT } from '../App';
import postManager from '../utils/post';
import { useHistory } from 'react-router';


const Post = ({post}:{post:PostState}) => {

    let history=useHistory();

    let [displayMode,setDisplayMode]=useState(false);
    let skeleton=createRef<HTMLDivElement>();
    let imgView=createRef<HTMLImageElement>();
    let profilePicImg=createRef<HTMLImageElement>();
    let authContext=useContext(AUTHCONTEXT);
    let messageInput=createRef<HTMLInputElement>();

    let commentContext=useContext(COMMENTCONTEXT);
    let postContext=useContext(POSTCONTEXT);

    let [showCommentView,setShowCommentView]=useState(false);

    useEffect(()=>{
        postManager.getAllCommentsAndLikes({
            authState:authContext?.authState,
            postId:post._id,
            setAllCommentsDispatch:commentContext?.setAllCommentsDispatch,
            commentsState:commentContext?.commentsState,
            likeTable:postContext?.likeTable,
            setLikeTable:postContext?.setLikeTable
        });
        postManager.checkLiked({
            authState:authContext?.authState,
            likeTable:postContext?.likeTable,
            postId:post._id,
            setLikeTable:postContext?.setLikeTable
        });
    },[post]);

    return (
        <section className="Post profile-view">
            <div className="header">
                <img onClick={()=>{
                    history.push("/profile",{
                        id:post.senderId._id
                    });
                }} src={`http://localhost:3000/fetcher/getProfilePic?pic=${post.senderId.pic}`} 
                alt="user-pic" onError={()=>{
                    if(profilePicImg.current) profilePicImg.current.src=Avatar;
                }} ref={profilePicImg}/>
                <h2 onClick={()=>{
                    history.push("/profile",{
                        id:post.senderId._id
                    });
                }}>{post.senderId.name}</h2> 
                {post.senderId._id==authContext?.authState._id?<img src={Dots} alt="post-menu" onClick={()=>{
                    authContext?.setEditProfileView({
                        show:true,
                        editProfileView:false,
                        postEditView:true,
                        post:post
                    });
                }}/>:<img style={{display:"none"}}/>}
            </div>
            <div className="main profile-view">
                <div className="main-display" style={
                        (post.contentType==="PIC")?{minHeight:"60vh"}:{}
                    }>
                    {(post.contentType==="PIC")?<>
                        <img src={`http://localhost:3000/fetcher/getPostPic?pic=${post.content}&token=${authContext?.authState.token}`} alt="" className={displayMode?"pic-large-view":"pic-small-view"} ref={imgView} onLoad={()=>{
                            if(skeleton.current) skeleton.current.style.display="none";
                        }}/>
                        <p onClick={()=>setDisplayMode(!displayMode)}><img src={Expand}/></p>
                        <div className="image-loading" ref={skeleton}></div>
                    </>:null}
                    {(post.contentType==="VIDEO")?<>
                        <video controls={true} src={`http://localhost:3000/fetcher/getPostVideo?token=${authContext?.authState.token}&name=${post.content}`}/>
                    </>:null}
                    {(post.contentType==="MESSAGE")?<>
                        <h6>{post.message}</h6>
                    </>:null}
                </div>
                <div className="main-details">
                    <div className="about">
                        <div className="menus">
                            {(postContext && postContext.likeTable.get(post._id) && (postContext.likeTable.get(post._id)!.no>0))?
                            <p>{postContext?.likeTable.get(post._id)?.no}</p>:null}
                            <img src={postContext?.likeTable.get(post._id)?.user?HeartYes:HeartNo} onClick={()=>postManager.likePost({
                                authState:authContext?.authState,
                                likeTable:postContext?.likeTable,
                                postId:post._id,
                                setLikeTable:postContext?.setLikeTable
                            })}/>
                            <img src={Comment} onClick={()=>setShowCommentView(!showCommentView)}/>
                            <img src={Share} onClick={()=>{
                                authContext?.setEditProfileView({
                                    show:true,
                                    editProfileView:false,
                                    postEditView:false,
                                    externalLinkView:true,
                                    post:post
                                });
                            }}/>
                            <img style={{marginLeft:"auto"}} src={(postContext?.savedPosts?.postsMap.has(post._id))?Saved:Save} onClick={()=>{
                                postManager.saveOrUnsavePost({
                                    setLoadingView:authContext?.setLoadingView,
                                    post:post,
                                    savedPosts:postContext?.savedPosts,
                                    setSavedPosts:postContext?.setSavedPosts,
                                    authState:authContext?.authState
                                });
                            }}/>
                        </div>
                        {(post.contentType!=="MESSAGE")?<div className="post-message">
                            {post.message}
                        </div>:null}
                    </div>
                    <div className="comments" style={showCommentView?{}:{display:"none"}}>
                        {commentContext?.commentsState[post._id]
                        ?.map((comment:any,i:number)=><p key={i}><span>{comment._id.name}</span>&nbsp;{comment.message}</p>)}
                    </div>
                    <div className="message-box" style={showCommentView?{}:{display:"none"}}>
                        <input type="text" placeholder="Comment here!" ref={messageInput}/>
                        <img src={Send} alt="Send->" onClick={()=>{
                            postManager.commentOnPost({
                                authState:authContext?.authState,
                                message:messageInput.current?.value.trim(),
                                postId:post._id,
                                setAllCommentsDispatch:commentContext?.setAllCommentsDispatch,
                                commentsState:commentContext?.commentsState
                            });
                        }}/>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default React.memo(Post);

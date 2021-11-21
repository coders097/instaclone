import { AuthState } from "../state/authState";
import { PostState } from "../state/postState";

let fetchRecentPostsFromFollowings=(data:{
    authState:AuthState,
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>>,
    setAllDispatch:React.Dispatch<{
        type: String;
        payload: any;
    }>
})=>{
    fetch("http://localhost:3000/fetcher/getAllRecentPostsOfFollowing",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState.token}`
        }
    }).then(res=>res.json())
    .then(_data=>{
        if(_data.success){
            _data.data=_data.data.sort((a:any,b:any)=>-(new Date(a.timeStamp).getTime()-new Date(b.timeStamp).getTime()));
            data.setAllDispatch({
                type:"LOAD_POSTS",
                payload:_data.data
            });
            // console.log(_data);
            data.setLoadingView(false);
        }else{
            console.log(_data.error);
        }
    })
    .catch(err=>{
        console.log(err);
        setTimeout(()=>{
            fetchRecentPostsFromFollowings(data);
        },3000);
    });
};

let addPost=(data:{
    authState:AuthState | undefined,
    message:string | undefined,
    file:File | null,
    setLoadingView?:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    clearUpload:()=>void,
    setAllDispatch:React.Dispatch<{
        type: String;
        payload: any;
    }> | undefined,
    posts:PostState[] | undefined,
    cacheParticularUserPosts:Map<string, PostState[]> | undefined
})=>{
    if(data && data.setLoadingView) data.setLoadingView(true);
    let formData=new FormData();
    formData.append("message",data.message!);
    if(data.file){
        formData.append("_data",data.file);
    }
    fetch("http://localhost:3000/post/addPost",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`
        },
        body:formData
    }).then(res=>res.json())
    .then(_data=>{
        if(data && data.setLoadingView) data.setLoadingView(false);
        if(_data.success){
            let res=_data.data;
            res.senderId={
                _id: data.authState?._id,
                name: data.authState?.name, 
                pic: data.authState?.pic
            }
            if(data.posts) data.posts=[res,...data.posts];
            if(data.setAllDispatch)
                data.setAllDispatch({
                    type:"ADD_POST",
                    payload:data.posts
                });
            // add it in cache map
            if(data.authState && data.cacheParticularUserPosts && data.cacheParticularUserPosts.has(data.authState._id as string)){
                (data.cacheParticularUserPosts.get(data.authState._id as string) as PostState[]).push(res);
            }
            data.clearUpload();
        }else{
            console.log(_data.error);
        }
    })
    .catch(err=>{
        if(data && data.setLoadingView) data.setLoadingView(false);
        console.log(err);
    });
}


let getAllCommentsAndLikes=(data:{
    authState:AuthState | undefined,
    postId:String,
    setAllCommentsDispatch:React.Dispatch<{
        type: String;
        payload: any;
      }> | undefined,
    commentsState:any,
    likeTable:Map<string, {
        no: number;
        user: boolean;
    }> | undefined,
    setLikeTable:React.Dispatch<React.SetStateAction<Map<string, {
        no: number;
        user: boolean;
    }>>> | undefined
})=>{
    fetch("http://localhost:3000/fetcher/getAllPostComments&Likes",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState?.token}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            postId:data.postId
        })
    }).then(res=>res.json())
    .then(_data=>{
        console.log(_data);
        if(_data.success){
            let res:any=data.commentsState;
            res[`${data.postId}`]=[
                ..._data.data.comments
            ];
            if(data.setAllCommentsDispatch)
                data.setAllCommentsDispatch({
                    type:"LOAD_COMMENTS",
                    payload:res
                });
            let like=data.likeTable?.get(data.postId as string);
            if(like){
                like.no=(_data.data.likes);
            }else{
                like={
                    no:(_data.data.likes),
                    user:false
                };
            }
            data.likeTable?.set(data.postId as string,like);
            if(data.setLikeTable)
                data.setLikeTable(new Map<string,{
                    no:number,
                    user:boolean
                }>(data.likeTable!));
        }else{
            console.log(_data.error);
        }
    }).catch(err=>console.log(err));
}


let commentOnPost=(data:{
    postId:String,
    message:String | undefined,
    authState:AuthState | undefined,
    setAllCommentsDispatch:React.Dispatch<{
        type: String;
        payload: any;
      }> | undefined,
    commentsState:any,
})=>{
    fetch("http://localhost:3000/post/commentPost",{
        method:"PATCH",
        headers:{
            "Authorization":`Bearer ${data.authState?.token}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            postId:data.postId,
            message:data.message
        })
    }).then(res=>res.json()).then(_data=>{
        if(_data.success){
            let res:any=data.commentsState;
            if(res[`${data.postId}`]){
                res[`${data.postId}`]=[
                    {
                        message:data.message,
                        timeStamp:new Date().toString(),
                        _id:{
                            name:data.authState?.name,
                            pic:data.authState?.pic
                        }
                    },
                    ...res[`${data.postId}`]
                ]
            }else{
                res[`${data.postId}`]=[
                    {
                        message:data.message,
                        timeStamp:new Date().toString(),
                        _id:{
                            name:data.authState?.name,
                            pic:data.authState?.pic
                        }
                    }
                ];
            }
            if(data.setAllCommentsDispatch)
                data.setAllCommentsDispatch({
                    type:"ADD_COMMENT",
                    payload:res
                }); 
        }else{
            console.log(_data.error);
        }
    }).catch(err=>console.log(err));
}

let checkLiked=(data:{
    authState:AuthState | undefined,
    postId:string,
    likeTable:Map<string, {
        no: number;
        user: boolean;
    }> | undefined,
    setLikeTable:React.Dispatch<React.SetStateAction<Map<string, {
        no: number;
        user: boolean;
    }>>> | undefined
})=>{
    fetch('http://localhost:3000/fetcher/checkLiked',{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState?.token}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            postId:data.postId
        })
    }).then(res=>res.json())
    .then(_data=>{
        if(_data.success){
            data.likeTable?.set(data.postId,_data.data);
            if(data.setLikeTable)
                data.setLikeTable(new Map<string,{
                    no:number,
                    user:boolean
                }>(data.likeTable!));
        }else{
            console.log(_data.error);
        }
    }).catch(err=>console.log(err));
}

let likePost=(data:{
    authState:AuthState | undefined,
    postId:string,
    likeTable:Map<string, {
        no: number;
        user: boolean;
    }> | undefined,
    setLikeTable:React.Dispatch<React.SetStateAction<Map<string, {
        no: number;
        user: boolean;
    }>>> | undefined
})=>{
    fetch('http://localhost:3000/post/likePost',{
        method:"PATCH",
        headers:{
            "Authorization":`Bearer ${data.authState?.token}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            postId:data.postId
        })
    }).then(res=>res.json())
    .then(_data=>{
        if(_data.success){
            data.likeTable?.set(data.postId,_data.data);
            if(data.setLikeTable)
                data.setLikeTable(new Map<string,{
                    no:number,
                    user:boolean
                }>(data.likeTable!));
        }else{
            console.log(_data.error);
        }
    }).catch(err=>console.log(err));
}


let editPost=(data:{
    authState:AuthState | undefined,
    message:string | undefined,
    file:File | null,
    setLoadingView?:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    setAllDispatch:React.Dispatch<{
        type: String;
        payload: any;
    }> | undefined,
    _id:string,
    contentType:string,
    allPosts: PostState[] | undefined,
    closeThisView:()=>void,
    savedPosts:{
        posts: PostState[];
        postsMap: Map<string, boolean>;
    } | undefined,
    cacheParticularUserPosts:Map<string, PostState[]> | undefined
})=>{
    if(data && data.setLoadingView) data.setLoadingView(true);
    let formData=new FormData();
    formData.append("message",data.message!);
    formData.append("postId",data._id);
    formData.append("contentType",data.contentType);
    if(data.file){
        formData.append("_data",data.file);
    }
    fetch("http://localhost:3000/post/editPost",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`
        },
        body:formData
    }).then(res=>res.json())
    .then(_data=>{
        if(data && data.setLoadingView) data.setLoadingView(false);
        if(_data.success){
            console.log(_data.data);
            let allPosts=data.allPosts?.map(e=>{
                if(e._id==_data.data._id){
                    return {
                        ..._data.data,
                        senderId:{
                            _id: data.authState?._id,
                            name: data.authState?.name, 
                            pic: data.authState?.pic
                        }
                    };
                }else return e;
            });
            if(data.setAllDispatch)
                data.setAllDispatch({
                    type:"UPDATE_POST",
                    payload:allPosts
                });

            // update changes in saved posts & user map posts
            if(data.savedPosts){
                data.savedPosts.posts=data.savedPosts.posts.map(post=>{
                    if(post._id!=data._id) return post;
                    return {
                        ..._data.data,
                        senderId:{
                            _id: data.authState?._id,
                            name: data.authState?.name, 
                            pic: data.authState?.pic
                        }
                    };
                });
            }
            if(data.authState && data.cacheParticularUserPosts && data.cacheParticularUserPosts.has(data.authState._id as string)){
                data.cacheParticularUserPosts.set(data.authState._id as string,
                    (data.cacheParticularUserPosts.get(data.authState._id as string) as PostState[]).map(post=>{
                        if(post._id!=data._id) return post;
                        return {
                            ..._data.data,
                            senderId:{
                                _id: data.authState?._id,
                                name: data.authState?.name, 
                                pic: data.authState?.pic
                            }
                        };
                    }));
            }
            data.closeThisView();
        }else{
            console.log(_data.error);
        }
    })
    .catch(err=>{
        if(data && data.setLoadingView) data.setLoadingView(false);
        console.log(err);
    });
};


let deletePost=(data:{
    authState:AuthState | undefined,
    _id:string,
    setAllDispatch:React.Dispatch<{
        type: String;
        payload: any;
    }> | undefined,
    allPosts: PostState[] | undefined,
    setLoadingView?:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    closeThisView:()=>void,
    savedPosts:{
        posts: PostState[];
        postsMap: Map<string, boolean>;
    } | undefined,
    cacheParticularUserPosts:Map<string, PostState[]> | undefined
})=>{
    if(data && data.setLoadingView) data.setLoadingView(true);
    fetch("http://localhost:3000/post/removePost",{
        method:"DELETE",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            postId:data._id
        })
    }).then(res=>res.json())
    .then(_data=>{
        if(data && data.setLoadingView) data.setLoadingView(false);
        if(_data.success){
            let allPosts=data.allPosts?.filter(e=>e._id!==data._id);
            if(data.setAllDispatch)
                data.setAllDispatch({
                    type:"UPDATE_POST",
                    payload:allPosts
                });
            // delete in saved posts & user map posts
            if(data.savedPosts){
                data.savedPosts.posts=data.savedPosts.posts.filter(post=>post._id!=data._id);
            }
            if(data.authState && data.cacheParticularUserPosts && data.cacheParticularUserPosts.has(data.authState._id as string)){
                data.cacheParticularUserPosts.set(data.authState._id as string,
                    (data.cacheParticularUserPosts.get(data.authState._id as string) as PostState[]).filter(post=>{
                        return post._id!=data._id;
                    }));
            }
            data.closeThisView();
        }else{
            console.log(_data.error);
        }

    }).catch(err=>{
        if(data && data.setLoadingView) data.setLoadingView(false);
        console.log(err);
    });
};

let fetchAllPostsFromParticularUser=(data:{
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    cacheParticularUserPosts:Map<string, PostState[]> | undefined,
    setCacheParticularUserPosts:React.Dispatch<React.SetStateAction<Map<string, PostState[]>>> | undefined,
    setPosts:React.Dispatch<React.SetStateAction<PostState[] | undefined>>,
    authState:AuthState | undefined,
    id:string
})=>{
    if(data.setLoadingView) data.setLoadingView(true);
    fetch("http://localhost:3000/fetcher/getAllPostDetails",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            userId:data.id
        })
    }).then(res=>res.json())
    .then(_data=>{
        if(data.setLoadingView) data.setLoadingView(false);
        if(_data.success){
            _data.data=_data.data.sort((a:any,b:any)=>{
                return -(new Date(a.timeStamp).getTime()-new Date(b.timeStamp).getTime());
            });
            // console.log(_data.data);
            data.cacheParticularUserPosts?.set(data.id,_data.data);
            if(data.setCacheParticularUserPosts && data.cacheParticularUserPosts)
            data.setCacheParticularUserPosts(new Map<string, PostState[]>(data.cacheParticularUserPosts));
            setTimeout(()=>{
                data.setPosts(_data.data);
            },1000);
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        if(data.setLoadingView) data.setLoadingView(false);
        console.log(err);
    });
}

let saveOrUnsavePost=(data:{
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    post:PostState,
    savedPosts:{
        posts: PostState[];
        postsMap: Map<string, boolean>;
    } | undefined,
    setSavedPosts:React.Dispatch<React.SetStateAction<{
        posts: PostState[];
        postsMap: Map<string, boolean>;
    }>> | undefined,
    authState:AuthState | undefined,
})=>{
    if(data.setLoadingView) data.setLoadingView(true);
    fetch("http://localhost:3000/post/savePost",{
        method:"PUT",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            postId:data.post._id
        })
    }).then(res=>res.json()).then(_data=>{
        if(data.setLoadingView) data.setLoadingView(false);
        if(_data.success){
            let map=data.savedPosts?.postsMap;
            let savedData=data.savedPosts?.posts;
            if(map?.has(data.post._id)){
                // remove
                map.delete(data.post._id);
                savedData=savedData?.filter(e=>e._id!=data.post._id);
            }else{
                // add
                map?.set(data.post._id,true);
                savedData?.push(data.post);
            }
            if(savedData && map && data.setSavedPosts)
                data.setSavedPosts({
                    posts:savedData,
                    postsMap:map
                });
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        console.log(err);
        if(data.setLoadingView) data.setLoadingView(false);
    });
}

let loadSavedPosts=(data:{
    savedPosts:{
        posts: PostState[];
        postsMap: Map<string, boolean>;
    },
    setSavedPosts:React.Dispatch<React.SetStateAction<{
        posts: PostState[];
        postsMap: Map<string, boolean>;
    }>>,
    authState:AuthState | undefined,
})=>{
    fetch("http://localhost:3000/fetcher/getSavedPostsOfMainUser",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`
        },
    }).then(res=>res.json()).then(_data=>{
        if(_data.success){
            // console.log("All Saved Data = ",_data.data);
            let map=data.savedPosts.postsMap;
            (_data.data as PostState[]).forEach(e => {
                map.set(e._id,true);
            });
            data.setSavedPosts({
                posts:_data.data,
                postsMap:map
            });
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        console.log(err);
    });
}

export default {
    fetchRecentPostsFromFollowings,
    addPost,
    getAllCommentsAndLikes,
    commentOnPost,
    checkLiked,
    likePost,
    editPost,
    deletePost,
    saveOrUnsavePost,
    loadSavedPosts,
    fetchAllPostsFromParticularUser
};
import { AuthState } from "../state/authState";
import { PostState } from "../state/postState";

let signIn=(data:{
    email:String,
    password:String,
    dispatch?:React.Dispatch<{
        type: String;
        payload: any;
    }>,
    setLoggedIn:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined
})=>{
    if(data.setLoadingView) data.setLoadingView(true);
    fetch('/auth/signin',{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:data.email,
            password:data.password
        })
    }).then(res=>res.json())
    .then(_data=>{
        if(_data.success){
            if(data.dispatch)
                data.dispatch({
                    type:"LOGIN",
                    payload:_data.data
                });
                setTimeout(()=>{
                    if(data.setLoggedIn)
                        data.setLoggedIn(true);
                },1500);
            console.log(_data);
        }else{
            console.log(_data.error);
            if(data.setLoadingView) data.setLoadingView(false);
        }
    }).catch(err=>{
        console.log(err);
        if(data.setLoadingView) data.setLoadingView(false);
    });
};

let signUp=(data:{
    email:String,
    password:String,
    name:String,
    pic:File | null
    dispatch?:React.Dispatch<{
        type: String;
        payload: any;
    }>,
    setLoggedIn:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined
})=>{
    if(data.setLoadingView) data.setLoadingView(true);
    let formData=new FormData();
    formData.append("name",data.name as string);
    formData.append("email",data.email as string);
    formData.append("password",data.password as string);
    if(data.pic){
        formData.append("pic",data.pic);
    }
    fetch("/auth/signup",{
        method:"POST",
        body:formData
    }).then(res=>res.json()).then(_data=>{
        if(_data.success){
            signIn({
                email:data.email,
                password:data.password,
                dispatch:data.dispatch,
                setLoggedIn:data.setLoggedIn,
                setLoadingView:data.setLoadingView
            });
        }else{
            console.log(_data.error);
            if(data.setLoadingView) data.setLoadingView(false);
        }
    }).catch(err=>{
        console.log(err);
        if(data.setLoadingView) data.setLoadingView(false);
    });
};


let checkValidity=({authContext,history}:{
                        authContext:{
                        loggedIn: Boolean;
                        setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
                        authState: AuthState;
                        authDispatch: React.Dispatch<{
                            type: String;
                            payload: any;
                        }>;
                        setLoadingView: React.Dispatch<React.SetStateAction<boolean>>;
                    } | null,
                        history:any
                    })=>{
    fetch('/auth/checkValidity',{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${authContext?.authState.token}`
        }
    }).then(res=>res.json()).then(_data=>{
        if(_data.success){
            console.log("WELCOME");
        }else{
            localStorage.removeItem("--login-details");
            authContext?.authDispatch({
                type:"LOGOUT",
                payload:{}
            });
            setTimeout(()=>{
                history.push("/");
                authContext?.setLoggedIn(false);
            },1500);
        }
    }).catch(err=>{
        console.log(err);
    });
};

let updateProfile=(data:{
    authState:AuthState | undefined,
    authDispatch:React.Dispatch<{ type: String; payload: any; }> | undefined,
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    name:string | undefined,
    email:string | undefined,
    password:string | undefined,
    details:string | undefined,
    closeThisView:()=>void
})=>{
    let name: string | null=null;
    let email:string | null=null;
    let password:string | null=null;
    let details:string | null=null;

    if(data.name && data.name.length>=3){
        name=data.name;
    }
    if(data.email){
        var regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // Converting the email to lowercase
        if(regexp.test(data.email.toLowerCase()))
            email=data.email;
    }
    if(data.password){
        if(data.password.length>=5){
            password=data.password;
        }
    }
    if(data.details && data.details.length>=3){
        details=data.details;
    }
    console.log(name,email,password,details);
    if(!name && !email && !password && !details){
        alert("Nothing To Update!");
        return;
    }
    let formData:any={};
    formData['oldPassword']=prompt("Enter your current password for Verification");
    if(name) formData["name"]=name;
    if(email) formData["email"]=email;
    if(password) {
        formData["password"]=password;
    }
    if(details) formData["details"]=details;

    let onSuccessFuncExec=()=>{

        let authState=data.authState;
        if(name && authState) authState.name=name;
        if(email && authState) authState.email=email;
        if(details && authState) authState.details=details;
        
        if(data.authDispatch)
            data.authDispatch({
                type:"UPDATE",
                payload:authState
            });
        setTimeout(()=>{
            localStorage.setItem("--login-details",JSON.stringify(authState));
            data.closeThisView();
        },1000);
    }

    if(data.setLoadingView) data.setLoadingView(true);
    fetch("/auth/editUser",{
        method:"PUT",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
    }).then(res=>res.json())
    .then(_data=>{
        if(data.setLoadingView) data.setLoadingView(false);
        if(_data.success){
            onSuccessFuncExec();
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        if(data.setLoadingView) data.setLoadingView(false);
        console.log("Not Done!");
    });
}

let searchUsers=(data:{
    searchField:string,
    setSearchData:React.Dispatch<React.SetStateAction<{
        pic: string;
        name: string;
        _id: string;
    }[]>>,
    authState:AuthState | undefined
})=>{
    fetch("http://localhost:3000/fetcher/getPeopleBySearch",{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${data.authState!.token!}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            searchField:data.searchField
        })
    }).then(res=>res.json())
    .then(_data=>{
        if(_data.success){
            data.setSearchData(_data.data);
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        console.log(err);
    })
};


let getDetailsOfParticularUser=(data:{
    id:string | null | undefined,
    authState:AuthState | undefined,
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    setData:React.Dispatch<React.SetStateAction<{
        details: string;
        email: string;
        name: string;
        pic: string;
        _id: string;
        followers: number;
        following: number;
    }>>
})=>{
    if(data.id){
        if(data.setLoadingView) data.setLoadingView(true);
        fetch("http://localhost:3000/fetcher/getClientDetails",{
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
            fetch("http://localhost:3000/fetcher/getFollowing&Followers",{
                method:"POST",
                headers:{
                    "Authorization":`Bearer ${data.authState!.token!}`,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    userId:data.id
                })
            }).then(res=>res.json())
            .then(__data=>{
                if(data.setLoadingView) data.setLoadingView(false);
                // console.log(_data, __data);
                if(__data.success){
                    _data.data["followers"]=__data.data["followers"];
                    _data.data["following"]=__data.data["following"];
                    data.setData(_data.data);
                }else{
                    console.log(__data.error);
                }
            })
            .catch(err=>{
                if(data.setLoadingView) data.setLoadingView(false);
                console.log(err);
            });
        }).catch(err=>{
            if(data.setLoadingView) data.setLoadingView(false);
            console.log(err);
        });
    }
}

let loadFollowings=(data:{
    authState:AuthState | undefined, 
    setFollowingMap:React.Dispatch<React.SetStateAction<Map<string, boolean>>>
})=>{
    fetch("http://localhost:3000/fetcher/getFollowingOfMainUser",{
            method:"POST",
            headers:{
                "Authorization":`Bearer ${data.authState!.token!}`
            }
        }).then(res=>res.json())
        .then(_data=>{
            if(_data.success){
                // console.log();
                let map=new Map<string, boolean>();
                (_data.data as string[]).map(_id=>{
                    map.set(_id,true);
                });
                data.setFollowingMap(map);
            }else{
                console.log(_data.error);
            }
        })
        .catch(err=>{
            console.log(err);
        });
}

let changeProfilePic=(data:{
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    authDispatch:React.Dispatch<{
        type: String;
        payload: any;
    }> | undefined,
    authState:AuthState | undefined,
    file:File | null,
    allPosts:PostState[] | undefined
})=>{
    if(data.setLoadingView) data.setLoadingView(true);
    let formData=new FormData();
    if(data.authState )
        formData.append("Authorization",data.authState.token as string);
    if(data.file) formData.append("pic",data.file);
    fetch("http://localhost:3000/auth/changeProfilePic",{
        method:"POST",
        body:formData
    }).then(res=>res.json())
    .then(_data=>{
        if(data.setLoadingView) data.setLoadingView(false);
        if(_data.success){
            if(data.authState && data.authDispatch){
                data.authState.pic=_data.data;
                data.authDispatch({
                    type:"UPDATE",
                    payload:data.authState
                });
                localStorage.setItem("--login-details",JSON.stringify(data.authState));
                let pic=_data.data;
                if(data.allPosts)
                    data.allPosts.forEach(post=>{
                        if(post.senderId._id==data.authState?._id)
                            post.senderId.pic=pic;
                    });
            } 
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        console.log(err);
        if(data.setLoadingView) data.setLoadingView(false);
    });
}

export default {
    signIn,
    signUp,
    checkValidity,
    updateProfile,
    searchUsers,
    getDetailsOfParticularUser,
    loadFollowings,
    changeProfilePic
}
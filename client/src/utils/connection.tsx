import { AuthState } from "../state/authState";

let follow=(data:{
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    authState:AuthState | undefined,
    id:string,
    setFollowingMap:React.Dispatch<React.SetStateAction<Map<string, boolean>>> | undefined,
    followingMap:Map<string, boolean> | undefined,
    data:{
        details: string;
        email: string;
        name: string;
        pic: string;
        _id: string;
        followers: number;
        following: number;
    },
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
    if(data.setLoadingView) data.setLoadingView(true);
    fetch("http://localhost:3000/connections/followUser",{
        method:"PUT",
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
            console.log("FOLLOWED!");
            data.followingMap?.set(data.id,true);
            if(data.followingMap && data.setFollowingMap)
                data.setFollowingMap(new Map<string,boolean>(data.followingMap));
            data.data.followers+=1;
            let temp={...data.data};
            data.setData(temp);
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        if(data.setLoadingView) data.setLoadingView(false);  
        console.log(err);
    });
};

let unfollow=(data:{
    setLoadingView:React.Dispatch<React.SetStateAction<boolean>> | undefined,
    authState:AuthState | undefined,
    id:string,
    setFollowingMap:React.Dispatch<React.SetStateAction<Map<string, boolean>>> | undefined,
    followingMap:Map<string, boolean> | undefined,
    data:{
        details: string;
        email: string;
        name: string;
        pic: string;
        _id: string;
        followers: number;
        following: number;
    },
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
    if(data.setLoadingView) data.setLoadingView(true);
    fetch("http://localhost:3000/connections/unfollowUser",{
        method:"PUT",
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
            console.log("UNFOLLOWED!");
            data.followingMap?.delete(data.id);
            if(data.followingMap && data.setFollowingMap)
                data.setFollowingMap(new Map<string,boolean>(data.followingMap));
            data.data.followers-=1;
            let temp={...data.data};
            data.setData(temp);
        }else{
            console.log(_data.error);
        }
    }).catch(err=>{
        if(data.setLoadingView) data.setLoadingView(false);  
        console.log(err);
    });
};

export default {
    follow,
    unfollow
};
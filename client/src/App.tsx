import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import PNFPage from './pages/PNFPage';
import ProfilePage from './pages/ProfilePage';
import PublicPostViewPage from './pages/PublicPostViewPage';
import SavedPage from './pages/SavedPage';
import postManager from './utils/post';
import authManager from './utils/auth';

// Importing Reducers & States
import _authReducer from './reducer/authReducer';
import _authState, { AuthState } from './state/authState';

import _postReducer from './reducer/postReducer';
import _postState, { PostState } from './state/postState';

import _commentReducer from './reducer/commentsReducer';
import _commentState from './state/commentsState';
import EditProfile from './components/EditProfile';

// Context APIs
export let AUTHCONTEXT=createContext<{
  loggedIn:Boolean,
  setLoggedIn:React.Dispatch<React.SetStateAction<boolean>>,
  authState:AuthState,
  authDispatch:React.Dispatch<{
    type: String;
    payload: any;
  }>,
  setLoadingView:React.Dispatch<React.SetStateAction<boolean>>,
  editProfileView:{
    show: boolean;
    editProfileView: boolean;
    externalLinkView?:boolean,
    postEditView: boolean;
    post:PostState | null;
},
  setEditProfileView:React.Dispatch<React.SetStateAction<{
    show: boolean;
    editProfileView: boolean;
    externalLinkView?:boolean,
    postEditView: boolean;
    post:PostState | null;
}>>,
  followingMap:Map<string, boolean>,
  setFollowingMap:React.Dispatch<React.SetStateAction<Map<string, boolean>>>
} | null>(null);

export let POSTCONTEXT=createContext<{
  allPosts:PostState[],
  setAllDispatch:React.Dispatch<{
    type: String;
    payload: any;
  }>,
  likeTable:Map<string, {
    no:number,
    user:boolean
  }>,
  setLikeTable:React.Dispatch<React.SetStateAction<Map<string,{
    no:number,
    user:boolean
  }>>>,
  cacheParticularUserPosts?:Map<string, PostState[]>,
  setCacheParticularUserPosts?:React.Dispatch<React.SetStateAction<Map<string, PostState[]>>>,
  savedPosts?:{
    posts: PostState[];
    postsMap: Map<string, boolean>;
  },
  setSavedPosts?:React.Dispatch<React.SetStateAction<{
    posts: PostState[];
    postsMap: Map<string, boolean>;
  }>>
} | null>(null);

export let COMMENTCONTEXT=createContext<{
  commentsState:any,
  setAllCommentsDispatch:React.Dispatch<{
    type: String;
    payload: any;
  }>
} | null>(null);



const App = () => {

  // Global loading View
  let [loadingView,setLoadingView]=useState(false);
  
  // Auth System
  let [loggedIn,setLoggedIn]=useState(false);
  let [authState,authDispatch]=useReducer(_authReducer,_authState);
  let [followingMap,setFollowingMap]=useState(new Map<string,boolean>());
  let [editProfileView,setEditProfileView]=useState<{
    show: boolean;
    editProfileView: boolean;
    postEditView: boolean;
    externalLinkView?:boolean,
    post: PostState | null;
}>({
    show:false,
    editProfileView:false,
    postEditView:false,
    externalLinkView:false,
    post:null
  });
  useEffect(()=>{
    if(loggedIn){
      localStorage.setItem("--login-details",JSON.stringify(authState));
      postManager.fetchRecentPostsFromFollowings({
        authState:authState,
        setLoadingView:setLoadingView,
        setAllDispatch:setAllDispatch
      });
      authManager.loadFollowings({
        authState:authState,
        setFollowingMap:setFollowingMap
      });
      postManager.loadSavedPosts({
        savedPosts:savedPosts,
        setSavedPosts:setSavedPosts,
        authState:authState
      });
    }else{
      let data=localStorage.getItem("--login-details");
      if(data){
        data=JSON.parse(data);
        authDispatch({
          type:"LOGIN",
          payload:data
        });
        setTimeout(()=>{
          setLoggedIn(true);
        },1500);
      }
    }
  },[loggedIn]);


  // Post System
  let [allPosts,setAllDispatch]=useReducer(_postReducer,_postState);
  let [cacheParticularUserPosts,setCacheParticularUserPosts]=useState(new Map<string,PostState[]>());
  let [savedPosts,setSavedPosts]=useState<{
    posts:PostState[],
    postsMap:Map<string,boolean>
  }>({
    posts:[],
    postsMap:new Map<string,boolean>()
  });

  // Comment System
  let [commentsState,setAllCommentsDispatch]=useReducer(_commentReducer,_commentState);

  // Like System 
  let [likeTable,setLikeTable]=useState(new Map<string,{
    no:number,
    user:boolean
  }>());

  return (
    <BrowserRouter>
      <AUTHCONTEXT.Provider value={{
        loggedIn,setLoggedIn,authState,authDispatch,setLoadingView,editProfileView,setEditProfileView,followingMap,setFollowingMap
      }}>
        <POSTCONTEXT.Provider value={{
          allPosts,setAllDispatch,likeTable,setLikeTable,cacheParticularUserPosts,setCacheParticularUserPosts,savedPosts,setSavedPosts
        }}>
          <COMMENTCONTEXT.Provider value={{
            commentsState,setAllCommentsDispatch
          }}>
              {loadingView?<div className="Loader">
                <div></div>
              </div>:null}

              {loggedIn?
              <Switch>
                  <Route exact path="/" render={()=><Home/>}/> 
                  <Route path="/profile" render={()=><ProfilePage/>}/>      
                  <Route path="/saved" render={()=><SavedPage/>}/>
                  <Route path="/external" render={()=><PublicPostViewPage/>}/>
                  <Route render={()=><PNFPage/>}/>
                  
              </Switch>:
              <Switch>
                  <Route exact path="/" render={()=><LandingPage/>}/> 
                  <Route exact path="/auth" render={()=><AuthPage/>}/>
                  <Route render={()=><PNFPage/>}/> 
              </Switch>}
              {loggedIn?<EditProfile/>:null}
            </COMMENTCONTEXT.Provider>
          </POSTCONTEXT.Provider>
        </AUTHCONTEXT.Provider>
    </BrowserRouter>
  );
};

export default App;

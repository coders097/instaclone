import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { AUTHCONTEXT, POSTCONTEXT } from '../App';
import Gallery from '../components/Gallery';
import Navbar from '../components/Navbar';
import UserDetailsView from '../components/UserDetailsView';
import { PostState } from '../state/postState';
import postManager from '../utils/post';

const ProfilePage = () => {

  let history=useHistory();
  let location=useLocation();
  let postContext=useContext(POSTCONTEXT);
  let authContext=useContext(AUTHCONTEXT);
  let [posts,setPosts]=useState<PostState[] | undefined>([]);

  useEffect(()=>{
    let state:{id:string}=location.state as {id:string};
    if(state!=null){
      let id=state.id;
      if(!id) {
        history.push("/pnf");
        return;
      }
      console.log(id);
      if(postContext?.cacheParticularUserPosts?.has(id)){
        setPosts(postContext.cacheParticularUserPosts.get(id));
        console.log("CACHE WORKING!");
      }else{
        postManager.fetchAllPostsFromParticularUser({
          setLoadingView:authContext?.setLoadingView,
          cacheParticularUserPosts:postContext?.cacheParticularUserPosts,
          setCacheParticularUserPosts:postContext?.setCacheParticularUserPosts,
          setPosts:setPosts,
          authState:authContext?.authState,
          id:id
        });
      }
    }else history.push("/pnf");
  },[location.state]);

  

    return (
        <>
          <Navbar/>
          <UserDetailsView id={(location.state as {id:string}).id} postsNumber={posts?.length}/>
          <Gallery posts={posts}/> 
        </>
    );
};

export default ProfilePage;
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { AUTHCONTEXT, POSTCONTEXT } from '../App';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import UploaderView from '../components/UploaderView';
import authManager from '../utils/auth';

const Home=()=>{

  let postsContext=useContext(POSTCONTEXT);
  let authContext=useContext(AUTHCONTEXT);
  let history=useHistory();
  useEffect(()=>{
    authManager.checkValidity({
      authContext:authContext,
      history:history
    });
  },[]);

    return (
        <>
          <Navbar/>
          <UploaderView/>
          {postsContext?.allPosts.map((post,index)=><Post key={post._id} post={post}/>)}
        </>
    );
}

export default Home;
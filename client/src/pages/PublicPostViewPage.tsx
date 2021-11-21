import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { AUTHCONTEXT } from '../App';
import Navbar from '../components/Navbar';
import Post from '../components/Post';

const PublicPostViewPage = () => {

  let location=useLocation();
  let history=useHistory();
  let [postData,setPostData]=useState(null);
  let authContext=useContext(AUTHCONTEXT);

  useEffect(()=>{
    if(!authContext?.loggedIn){
      history.push("/");
      return;
    }
    try{
      const paramsString = location.search.substring(1);
      let searchParams = new URLSearchParams(paramsString);
      console.log(searchParams.get("id"));
      (()=>{
        fetch(`http://localhost:3000/fetcher/getSinglePostDetails/${searchParams.get("id")}`)
          .then(res=>res.json())
          .then(data=>{
            if(data.success){
              console.log(data);
              setPostData(data.data);
            }else{
              history.push("/pnf");
            }
          }).catch(err=>{
            console.log(err);
          })
      })();
    }catch(e){
      history.push("/pnf");
    }
  },[]);
    return (
        <>
          <Navbar/>
          {postData?<Post post={postData} key={1}/>:null}  
        </>
    );
};

export default PublicPostViewPage;
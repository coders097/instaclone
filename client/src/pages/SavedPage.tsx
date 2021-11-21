import React, { useContext, useEffect, useState } from 'react';
import { POSTCONTEXT } from '../App';
import Gallery from '../components/Gallery';
import Navbar from '../components/Navbar';
import { PostState } from '../state/postState';

const SavedPage = () => {

    let postContext=useContext(POSTCONTEXT);
    
    let [data,setData]=useState<PostState[]>([]);
    useEffect(()=>{
        if(postContext && postContext.savedPosts) {
            let posts=postContext.savedPosts.posts
            .sort((a,b)=>-(new Date(a.timeStamp as string).getTime()-new Date(b.timeStamp as string).getTime()));
            setData(posts);
        }
    },[postContext?.savedPosts]);

    return (
        <>
            <Navbar/>
            <h2 style={{
                padding:"25px",
                fontSize:"2.5rem",
                color:"grey",
                textAlign:"center"
            }}>{data.length>0?"Saved Posts":"No Saved Posts!"}</h2>
            <Gallery posts={data}/> 
        </>
    );
};

export default SavedPage;
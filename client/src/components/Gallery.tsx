import React, { useContext, useEffect } from 'react';
import '../scss/Gallery.scss';

import pic0 from '../assets/1.jpg';
import pic1 from '../assets/2.jpg';
import pic2 from '../assets/3.jpg';
import pic3 from '../assets/4.jpg';
import pic4 from '../assets/5.jpg';
import pic5 from '../assets/6.jpg';
import pic6 from '../assets/pic.jpg';
import { PostState } from '../state/postState';
import { AUTHCONTEXT, POSTCONTEXT } from '../App';
import { useHistory } from 'react-router';

const Gallery = ({posts}:{
    posts:PostState[] | undefined
}) => {

    let authContext=useContext(AUTHCONTEXT);
    let postContext=useContext(POSTCONTEXT);
    let history=useHistory();
    
    return (
        <section className="Gallery">
            {posts?.map((post,i)=>{
                if(post.contentType==="PIC")
                    return <img onClick={()=>history.push(`/external?id=${post._id}`)} key={i} src={`http://localhost:3000/fetcher/getPostPic?pic=${post.content}&token=${authContext?.authState.token}`}/>;
                else if(post.contentType==="MESSAGE")
                    return <div onClick={()=>history.push(`/external?id=${post._id}`)} key={i}><p>{post.message}</p></div>;
                else return <div onClick={()=>history.push(`/external?id=${post._id}`)} key={i}><video src={`http://localhost:3000/fetcher/getPostVideo?name=${post.content}&token=${authContext?.authState.token}`}/></div>
            })}
        </section>
    );
};

export default Gallery;
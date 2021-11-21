import React, { useState } from 'react';
import { useHistory } from 'react-router';
import '../scss/LandingPage.scss';
import Vid from '../assets/sample.mp4';

import Add from '../assets/icons/plus.png';
import Save from '../assets/icons/bookmark.png';
import Edit from '../assets/icons/pen.png';
import Del from '../assets/icons/bin.png';
import Share from '../assets/icons/share.png';
import Follow from '../assets/icons/follower.png';
import Search from '../assets/icons/loupe.png';

const LandingPage=()=>{

    let history=useHistory();
    let [enLang,setEnLang]=useState(true);

    return (
        <>
            <nav>
                <h1>socialpic</h1>
                <div className="links">
                    <a href="#">Home</a>
                    <a href="#land_about">About</a>
                    <a href="#land_explore">Explore</a>
                    <a href="#land_join">Join</a>
                </div>
                <button className="landing_btn" onClick={()=>history.push("/auth")}>
                    Login
                </button>
            </nav>
            <div className="LandingPage_hero" id="land_home">
                <h2>{enLang?'Bringing you closer to the people and things you love':'आपको उन लोगों और चीज़ों के करीब लाना जिनसे आप प्यार करते हैं'}</h2>
                <p>{enLang?'Share your adventures all over the globe. Create amazing posts with pic or video & also see what others are posting':'दुनिया भर में अपने कारनामों को साझा करें। तस्वीर या वीडियो के साथ अद्भुत पोस्ट बनाएं और यह भी देखें कि दूसरे क्या पोस्ट कर रहे हैं'}</p>
                <video src={Vid} autoPlay={true} loop={true} ></video>                
            </div>
            <section className="LandingPage_about" id="land_about">
                <h3 className="__head_one">About</h3>
                <p>{enLang?<><span>Socialpic</span> "is a photo and video sharing social networking service started in 2021. You can create, edit, share and also delete posts whenever you want with your followers! You can follow the people you want to. Your security is also a part of our company."</>:
                <><span>सोशलपिक 2021 में शुरू की गई एक फोटो और वीडियो साझा करने वाली सोशल नेटवर्किंग सेवा है। आप अपने अनुयायियों के साथ जब चाहें पोस्ट बना सकते हैं, संपादित कर सकते हैं, साझा कर सकते हैं और हटा भी सकते हैं! आप उन लोगों का अनुसरण कर सकते हैं जिन्हें आप चाहते हैं। आपकी सुरक्षा भी हमारी कंपनी का एक हिस्सा है।</span></>}</p>
                <h2><span>CEO</span> John Legend</h2>
            </section>
            <section className="LandingPage_explore" id="land_explore">
                <h3>Things you can do</h3>
                <p>{enLang?"Our App really provides you a lot of functionalities to make your user experience the best.":'हमारा ऐप वास्तव में आपको आपके उपयोगकर्ता अनुभव को सर्वश्रेष्ठ बनाने के लिए बहुत सारी सुविधाएँ प्रदान करता है।'}</p>
                <div className="items">
                    <div className="item">
                        <img src={Add}/>
                        <h4>Create Post</h4>
                        <p>Upload pics & videos and share them with the world!</p>
                    </div>

                    <div className="item">
                        <img src={Search}/>
                        <h4>Search People</h4>
                        <p>You can even search for people and make friends!</p>
                    </div>

                    <div className="item">
                        <img src={Follow}/>
                        <h4>Follow People</h4>
                        <p>Connect with your friends & people to see their posts!</p>
                    </div>

                    <div className="item">
                        <img src={Edit}/>
                        <h4>Edit Post</h4>
                        <p>Send a wrong post or wanna update them, socialpic will help you sure.</p>
                    </div>

                    <div className="item">
                        <img src={Del}/>
                        <h4>Delete Post</h4>
                        <p>Posted really something bad don't worry just delete them!</p>
                    </div>

                    <div className="item">
                        <img src={Share}/>
                        <h4>Share Post</h4>
                        <p>Yep! you can even share them with the world!</p>
                    </div>

                    <div className="item">
                        <img src={Save}/>
                        <h4>Save Post</h4>
                        <p>Liked a post then save it, later remove it anytime.</p>
                    </div>
                </div>
            </section>
            <section className="LandingPage_join" id="land_join">
                <h3 className="__head_one">Join our newsletter</h3>
                <p>{enLang?"Get informations about our latest updates, security features. Feel free to be a part of our developers community. Give us an email and we shall contact you soon!":"हमारे नवीनतम अपडेट, सुरक्षा सुविधाओं के बारे में जानकारी प्राप्त करें। बेझिझक हमारे डेवलपर समुदाय का हिस्सा बनें। हमें एक ईमेल दें और हम जल्द ही आपसे संपर्क करेंगे!"}</p>
                <input type="email" placeholder={enLang?"Enter your email here!":"अपना मेल यहाँ दर्ज करें!"}/>
                <button className="landing_btn">Join</button>
            </section>
            <footer>
                <div className="left">
                    <h1>socialpic</h1>
                    <p>Copyright 2021</p>
                    <p>BBSR, India</p>
                    <p>Language <select onChange={(e)=>{
                        if(e.target.value==="en") setEnLang(true);
                        else setEnLang(false);
                    }}>
                        <option value="en">EN</option>
                        <option value="hin">HIN</option>
                    </select></p>
                </div>
                <div className="right">
                    <p>Made by Biswamohan</p>
                    <p>Email : bmd097@gmail.com</p>
                    <p>Ph no : +91 8917405871</p>
                </div>
            </footer>
        </>
    );
}

export default LandingPage;
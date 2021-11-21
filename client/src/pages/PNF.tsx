import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import { AUTHCONTEXT } from '../App';
import Navbar from '../components/Navbar';

const PNF=()=> {

    let history=useHistory();
    let authContext=useContext(AUTHCONTEXT);
    useEffect(()=>{
      if(authContext?.loggedIn){
        history.push("/");
      }
    },[]);

    return (
        <>
          <div className="PNF">
            <h1>404</h1>
            <p>The link you followed may be broken, or the page may have been removed. Go back to socialpic.</p>
            <button onClick={()=>{
              history.push("/");
            }}>Home</button>
          </div>  
        </>
    );
}

export default PNF;
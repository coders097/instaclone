import { AuthState } from "../state/authState";

const reducer=(state:AuthState,action:{
    type:String,
    payload:any
})=>{
    switch(action.type){
        case "LOGIN":
            return action.payload;
        
        case "LOGOUT":
            return {
                _id: "",
                name: "",
                email: "",
                pic: "",
                details:"",
                token: ""
            };
        
        case "UPDATE":
            return {...action.payload};
            
        default:
            return state;
    }
}

export default reducer;
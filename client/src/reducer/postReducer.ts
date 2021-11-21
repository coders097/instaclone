import { PostState } from "../state/postState";

const reducer=(state:PostState[],action:{
    type:String,
    payload:any
})=>{
    switch(action.type){
        case "LOAD_POSTS":
            return action.payload;
        
        case "ADD_POST":
            return action.payload;
        
        case "UPDATE_POST":
            return action.payload;
        default:
            return state;
    }
}

export default reducer;
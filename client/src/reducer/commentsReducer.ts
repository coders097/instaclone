
const reducer=(state:any,action:{
    type:String,
    payload:any
})=>{
    switch(action.type){
        case "LOAD_COMMENTS":
            // console.log("here",action.payload);
            return {...action.payload};
        
        case "ADD_COMMENT":
            return {...action.payload};
        
        default:
            return state;
    }
}

export default reducer;
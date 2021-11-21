export interface AuthState{
    _id: String,
    name: String,
    email: String,
    pic: String,
    details:String,
    token:String
}

let state:AuthState={
    _id: "",
    name: "",
    email: "",
    pic: "",
    details:"",
    token: ""
};

export default state;
export interface PostState{
    contentType:"MESSAGE" | "PIC" | "VIDEO"   ,
    message:String,
    content:String,
    timeStamp:String,
    _id:string,
    senderId:{
        _id: string,
        name: string, 
        pic: string
    }
}

let state:PostState[]=[];

export default state;


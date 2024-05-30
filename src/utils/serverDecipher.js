export function decipher(msg, key){
    if(msg === undefined){
        msg = "closed";
    }
    if(key === undefined){
        key = 0;
    }

    let result = "";
    for(let i = 0; i < msg.length; i++){
        let chara = String.fromCharCode(parseInt(msg.charCodeAt(i)) - key);
        result += chara;
    }

    return result;
}
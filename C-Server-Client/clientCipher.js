function cipher(msg, key){
    if(msg === undefined){
        msg = "closed";
    }
    if(key === undefined){
        key = 0;
    }

    let result = "";
    for(let i = 0; i < msg.length; i++){
        let chara = String.fromCharCode(parseInt(msg.charCodeAt(i)) + key);
        result += chara;
    }

    return result;
}

function main(){
    let message = "test,1234";
    let deciphered = cipher(message, 5);

    console.log(deciphered);
}

main();
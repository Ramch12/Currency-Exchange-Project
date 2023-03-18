function GenOTP()
{
    let coll='0123456789';
    let otp=''
    for(i=0;i<6;i++)
    {
        otp+=coll[Math.floor(Math.random()*10)];
    }
    if (otp.length <= 5) {
        return GenOTP();
    }
   return otp; 
}
exports.GenOTP=GenOTP;


function gen_username()
{
    let coll='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let user_name='';
    for(let i=0;i<6;i++)
    {
	   user_name+=coll[Math.floor(Math.random()*36)];    
    }
    return user_name;  
}

exports.gen_username=gen_username;
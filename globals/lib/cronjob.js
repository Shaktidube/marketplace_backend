const cron = require('node-cron');
const cronFun = {};
cron.cronJob = (object) => {

    cron.schedule("*/5 * * * * *",()=>{
        if(object.sMembership == "silver"){
            object.nBalance += 1
            oExistingUser.save();
            // console.log(object.nBalance);
        } else if(object.sMembership == "gold"){
            object.nBalance += 4
            oExistingUser.save();
            // console.log(object.nBalance);
            
        }else if(object.sMembership == "platinum"){
            object.nBalance += 5
            oExistingUser.save();
            // console.log(object.nBalance);
        }
    })
}
    

module.exports = cronFun;
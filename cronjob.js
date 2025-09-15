const cron = require("node-cron");
const { User } = require("./app/models");

const updateBalance = async () => {
    let  oUsers =  await User.find({})
    for (const element of oUsers) {
      // console.log(element.sMembership);
      // console.log(element.nBalance);
      cron.schedule("*/5 * * * * *", async() => {
        switch (element.sMembership) {
          case "silver":
            element.nBalance += 1;
            break;
          case "gold": 
            element.nBalance += 4;
            break;
          case "platinum":
            element.nBalance += 10;
            break;
          }
          await element.save();
        });
    }
      
}

updateBalance().then((data)=>{
  console.log(data);
}).catch((err)=>{
  console.log(err);
})

module.exports = updateBalance;
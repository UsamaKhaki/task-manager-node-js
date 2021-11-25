require('./db/mongoose');
const Tasks = require("./models/tasks");
const Users = require("./models/users");

// Tasks.findByIdAndDelete('619a2472068f8aa53eaa795d').then((task) => {
//     console.log(task);
//     return Tasks.countDocuments({ completed: false })
// }).then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// })

const updateAgeAndCount = async (id, age) => {
    const user = await Users.findByIdAndUpdate(id, { age });
    const count = await Users.countDocuments({age});
    return count;
}

updateAgeAndCount('6194ecc0332238bf8999bc35', 2).then((count) => {
    console.log(count);
}).catch((err) => {
    console.log(err);
})
require('../db/mongoose');
const Tasks = require("../models/tasks");

// Tasks.findByIdAndDelete('619a2472068f8aa53eaa795d').then((task) => {
//     console.log(task);
//     return Tasks.countDocuments({ completed: false })
// }).then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// })


const deleteTaskAndCount = async (id) => {
    const task = await Tasks.findByIdAndDelete(id);
    const count = await Tasks.countDocuments({completed: true});
    return count;
}

deleteTaskAndCount('6194ed01332238bf8999bc46').then((count) => {
    console.log(count);
    return 'Done';
}).catch((err) => {
    console.log(err);
})
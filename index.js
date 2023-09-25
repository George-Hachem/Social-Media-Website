// const { PrismaClient } = require('@prisma/client');
// const faker = require('@faker-js/faker');

// (async () => {
//     const prisma = new PrismaClient();

//     const usersArr = [];

//     for (let i = 0; i < 100; i += 1) {
//         usersArr.push({
//             name: faker.person.fullName(),
//             password: faker.internet.password(),
//         })
//     }

//     await prisma.exampleUser.createMany({
//         data: usersArr,
//     })
// })();
const express = require('express')
const bodyParser = require('body-parser');
const path = require('path')
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();

const redisOptions = {
    host: 'localhost', // Replace with your Redis server host
    port: 6379, // Replace with your Redis server port
    // Add more Redis configuration options if needed
  };

app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
  }));

app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname,'public')))
app.set('view-engine', 'ejs')



// attain userid
async function getUserId(username) {
    try {
      const user = await prisma.exampleUser.findUnique({
        where: {
          name: username,
        },
        select: {
          id: true,
        },
      });
      return user.id;
    } catch (error) {
      console.error(`Error retrieving user ID for ${username}:`, error);
      return null;
    }
  }

//user1 follows user2
async function createFollowRelationship(userId1, userId2) {
try {
    await prisma.Follow.create({
    data: {
        followerId: userId1,
        followeeId: userId2,
    },
    });
    console.log('Follow relationship created successfully.');
} catch (error) {
    console.error('Error creating follow relationship:', error);
}
}



app.route("/")
  .get((req, res) => {
    console.log("Using signup");
    res.render('signup.ejs', { error: null });
  })

  .post(async (req, res) => {
    const username = req.body['Username'];
    const firstName = req.body['First Name'];
    const lastName = req.body['Last Name'];
    const password = req.body['Password'];

    try {
      // Check if the username already exists
      const existingUser = await prisma.exampleUser.findUnique({
        where: {
          username: username,
        },
      });

      if (existingUser) {
        // Render an error message when the username is already taken
        res.render('signup.ejs', {
          error: 'Username is already taken. Please choose a different username.',
        });
        return; // Stop further execution
      }

      // Register the new user
      await prisma.exampleUser.create({
        data: {
          username: username,
          firstName: firstName,
          lastName: lastName,
          password: password,
        },
      });
    } catch (err) {
      throw err;
    }
    req.session.username = username;
    req.session.save()
    res.redirect('/home');
  });


app.route("/home")
.get(async(req, res)=>{
    console.log("Using home")
    const loggedInUserId = req.session.username
    const userPostsAndFollowedPosts = await prisma.post.findMany({
        where: {
          OR: [
            { userId: loggedInUserId }, // Posts by the logged-in user
            {
              user: {
                followers: {
                  some: {
                    followerId: loggedInUserId, // Posts by users that the logged-in user follows
                  },
                },
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'desc', // Order by most recent
        },
      });
    console.log("Heyyyy:")
    console.log(userPostsAndFollowedPosts)
      
    res.render('home.ejs', {userPostsAndFollowedPosts})
})

.post(async(req, res)=>{
    const user = req.session.username 
    try{

        if(req.method === 'POST'){
            if ('Search' in req.body){
                const username = req.body['nameSearch'];
                const userSearched = await prisma.exampleUser.findUnique({
                    where: {
                    username: username,
                    },
                });
                if(userSearched){

                    const userSearch = userSearched.username
                    //res.render('home.ejs', {userSearch})
                    req.session.username2 = userSearch
                    console.log(req.session.username2)
                    req.session.save()
                    res.redirect('/profile')
                    return;
                }
            }
            if ('send-tweet' in req.body){
                const tweet = req.body['tweet']

                await prisma.Post.create({
                    data: {
                        content: tweet,
                        userId: user,
                    },
                });
            }
        }
        
        
    }catch(err){
        throw err
    }
    res.redirect('/home')

})


app.route("/profile")
  .get(async(req, res) => {
    console.log("Using profile");
    const vistor = req.session.username
    const userProfile = req.session.username2;
    console.log(req.session.username2);


    const doesFollow = await prisma.follow.findFirst({
        where: {
          followerId: vistor,
          followeeId: userProfile,
        },
      });

    console.log(doesFollow)

    const followerCount = await prisma.follow.count({
        where: {
          followeeId: userProfile,
        },
    });

    const followCount = await prisma.follow.count({
        where: {
            followerId: userProfile
        }
    })


    res.render('profile.ejs', { userProfile , followerCount, followCount, doesFollow});
  })
  .post(async(req, res) => {
    // If you want to handle POST requests to the profile page, add your logic here
    try{
        if (req.method === "POST"){
            const followee = req.session.username2
            const follower = req.session.username
            if ('follow' in req.body){
                await prisma.follow.create({
                    data: {

                        followerId: follower,
                        followeeId: followee,
                    },
                });
            }

            if ('unfollow' in req.body){
                
                await prisma.follow.deleteMany({
                    where: {
                      followerId: follower,
                      followeeId: followee,
                    },
                  });
            }
        }
    }catch(err){
        throw err
    }

    res.redirect('/profile');
  });

app.listen(4000, ()=>{
    console.log("Server is running")
})
// app.listen(2000, '0.0.0.0', ()=>{
//     console.log("Server is running on http://localhost:2000")
// })


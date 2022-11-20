require("dotenv").config();
// const { application } = require("express");
const express = require("express");
const cors =require("cors");
const db = require("./db/index");
const { application } = require("express");
// const morgan = require("morgan");
const App = express();

// App.use(morgan("dev"));

// App.use((req, res, next) => {
//     res.status(404).json({
//         status: "fail"
// })
//     next();
// })

App.use(cors());

App.use(express.json());

App.get("/api/v1/restaurants", async (req, res) => {

    try {
        // const results = await db.query("select * from restaurants");
        const restaurantRatingData = await db.query( 
            "SELECT * FROM restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;"
        );


        // console.log("route hander ran");
        res.status(200).json({
            status: "success",
            results: restaurantRatingData.rows.length,
            data: {
                restaurants: restaurantRatingData.rows
            }
        });
    } catch(err) {
        console.log(err);
    }    
    
});
//http://localhost:3050/getRestaurants

//get a restaurant
App.get("/api/v1/restaurants/:id", async (req, res) => {
    console.log(req.params.id);
    try {
        const restaurant = await db.query("SELECT * FROM restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id=$1;"
        , [req.params.id,]);
        //select * from restaurants where id = req.params.id

        const reviews = await db.query("select * from reviews where restaurant_id = $1", [
            req.params.id,
        ]);

        res.status(200).json({
            status: "success",
            data: {
                restaurant: restaurant.rows[0],
                reviews: reviews.rows
            },
        });
    } catch (err) {}
    
});

//create a restaurant
App.post("/api/v1/restaurants", async (req, res) => {
console.log(req.body);
try {
    const results = await db.query("INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) returning *", [
        req.body.name,
        req.body.location, 
        req.body.price_range]);
        res.status(201).json({
            status: "success",
            data: {
                restaurants: results.rows[0]
            }
        });
} catch (err) {
    console.log(err);
}
});

//Update Restaurants
App.put("/api/v1/restaurants/:id", async (req, res) => {
try {
    const results = await db.query(
        "UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id = $4 returning *",
        [req.body.name, req.body.location, req.body.price_range, req.params.id]);
    res.status(200).json({
        status: "success",
        data: {
            restaurant: results.rows[0]
        }
    });
} catch (err) {
    console.log(err)
}
    console.log(req.params.id);
    console.log(req.body);  
});

//delete restaurant
App.delete("/api/v1/restaurants/:id", async (req, res) => {
    try {
        const results = db.query(
            "DELETE FROM restaurants WHERE id = $1",
            [req.params.id])
            res.status(204).json({
                status: "success"
            });
            console.log(results);
    } catch (err) {
        console.log(err)
    }
    
});

App.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
    try {
        const newReview = await db.query(
            "INSERT INTO reviews (restaurant_id, name, review, rating) VALUES ($1, $2, $3, $4) returning *",
            [req.params.id, req.body.name, req.body.review, req.body.rating]);
            console.log(newReview);
            res.status(201).json({
                status: 'success',
                data: {
                    review: newReview.rows[0],
                }
            });
    } catch (err) {}
});


const port = process.env.PORT || 3001;
App.listen(port, () => {
    console.log(`server is up and listening on port ${port}`);
});
const express = require('express')
const db = require('./db')

const app = express()

app.use(express.json())


app.use('/users', (req, res) => {
    let { page = 1, limit = 10, name, age, sortBy } = req.query

    // set page and limit if try to manupulate
    console.log('name', name)
    if (page <= 0 || limit <= 0) {
        page = 1
        limit = 5;
    }

    // to protect the sortBy 
    let sortValue = ['id', 'age', 'name', 'email']
    let sortNew = sortBy.split(',')
    console.log('sortBy', typeof sortNew)

    sortNew = sortNew.filter((value) => sortValue.includes(value))

    if(sortNew.length === 0){
        sortNew = ["id"]
    }

    // PROTECT AGE FROM MANIPULATION
    //set default page and limit if not provided
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const offset = (page - 1) * limit;

    let query = `SELECT * from users WHERE 1=1`;

    if (name) {
        query += ` AND name LIKE '%${name}%'`;
    }

    if (age) {
        query += ` AND age = ${age}`;
    }

    if (sortBy) {
        sortNew =sortNew.join(',')
        query += ` ORDER BY ${sortNew}`;
        // query += ` ORDER BY ${nnn.join(', ')}`;
    }

    query += ` LIMIT ${offset}, ${limit}`;
    // here this query above is responsible for the startPageIndex and the endPageIndex
    //first offset define the 1st and by limiting it to limit
    // other way for javascript which is acttaully the same result
    //  startPageIndex = (page - 1 )*limit
    //endPageIndex  = page * limit
    // const result =  slice(startPageIndex, endPageIndex)

    //Exexuting query

    db.query(query, (err, results) => {
        if (err) {
            console.error('error execting query:', err)
            return res.status(500).json({ error: 'Internal server error' })
        }

        // sending result
        res.status(200).json({
            page,
            limit,
            data: results
        });
    })
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})



// THIS BELOW QUERY IS MAY BE THE OLD VERSION QUERY
// query += ` LIMIT ${limit} OFFSET ${offset}`; //add pagination (limit and offset) //
app.use('/users', (req, res) => {
    let { page = 1, limit = 10, name, age, sortBy } = req.query;

    // Ensure valid values for page and limit (positive integers)
    if (page <= 0 || limit <= 0) {
        page = 1;
        limit = 5;
    }

    // To protect the sortBy input
    const sortValue = ['id', 'age', 'name', 'email'];
    let sortNew = sortBy ? sortBy.split(',') : [];

    // Sanitize the sortBy values to ensure only valid fields are used
    sortNew = sortNew.filter((value) => sortValue.includes(value));

    // If no valid sort columns, default to "id"
    if (sortNew.length === 0) {
        sortNew = ['id'];
    }

    // Protect from direct manipulation of page and limit values
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const offset = (page - 1) * limit;

    // Base query
    let query = `SELECT * FROM users WHERE 1=1`;

    // Add filters to the query if provided
    if (name) {
        // Using parameterized query to prevent SQL Injection
        query += ` AND name LIKE ?`;
    }

    if (age) {
        // Parameterized query for age to avoid SQL injection
        query += ` AND age = ?`;
    }

    // Apply sorting if provided
    if (sortBy) {
        sortNew = sortNew.join(', ');
        query += ` ORDER BY ${sortNew}`;
    }

    // Add pagination to the query
    query += ` LIMIT ?, ?`;

    // Executing the query with sanitized inputs
    db.query(query, [
        name ? `%${name}%` : null,  // For LIKE query with name
        age ? age : null,           // For exact match query with age
        offset,                     // Pagination offset
        limit                       // Pagination limit
    ], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the paginated results
        res.status(200).json({
            page,
            limit,
            data: results
        });
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Improvements:
// Sanitizing and Validating sortBy:
// We ensure that only valid columns(i.e., id, age, name, and email) are used in the ORDER BY clause.Any invalid or malicious values in sortBy are filtered out, and if no valid sort column is provided, we default to id.

// SQL Injection Prevention:
// We use parameterized queries(prepared statements) to avoid SQL injection.This is particularly important when including user - provided values like name and age in SQL queries.
// For the name filter, we use LIKE ? to match values with wildcards(%).Similarly, age is used with ? for an exact match.


// Pagination Logic:

// We ensure that page and limit are always positive integers.If either is invalid, we fall back to default values(page = 1 and limit = 5).
// The offset for pagination is calculated as (page - 1) * limit to determine which rows to retrieve from the database.

// Default sortBy Handling:
// If the sortBy query parameter is provided, we split it into an array and filter only valid columns.If no valid sortBy value is found, we default to sorting by id.

// Flexible Query Construction:
// The query is dynamically built to include filters for name and age, sorting options, and pagination, based on the input parameters.

// Error Handling:
// Proper error handling is in place.If there’s an error executing the query, the server responds with a 500 status code and a generic error message.

// Pagination Query:
// LIMIT ?, ? is used in the query to handle pagination.The first ? corresponds to the offset, and the second ? corresponds to the limit.
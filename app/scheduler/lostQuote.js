// app\scheduler\lostQuote.js

const connection = require('../../config/DbConfig'); // Assuming you have a database connection

async function assignLostQuotesToSalesEmployees() {
    try {
        // Step 1: Fetch all lost status quotes
        const selectLostQuotesQuery = 'SELECT id FROM quote WHERE status = 7'; // Assuming status 7 is for 'Lost'
        const [lostQuotes, _] = await connection.query(selectLostQuotesQuery);

        // Step 2: Fetch all active sales employees
        const selectSalesEmployeeQuery = 'SELECT * from employee where department = "sales"'
        const [activeSalesEmployees, __] = await connection.query(selectSalesEmployeeQuery); // You should implement this in your Employee model
        // console.log(activeSalesEmployees)
        // console.log('--------------------------')
        // Step 3: Calculate the average number of lost quotes per sales employee
        const averageLostQuotesPerEmployee = Math.floor(lostQuotes.length / activeSalesEmployees.length);

        // Step 4: Shuffle the list of lost quotes
        const shuffledLostQuotes = shuffleArray(lostQuotes);
        // Step 5 & 6: Assign lost quotes to sales employees
        let lostQuoteIndex = 0;
        for (const salesEmployee of activeSalesEmployees) {
            for (let i = 0; i < averageLostQuotesPerEmployee; i++) {
                if (lostQuoteIndex >= shuffledLostQuotes.length) {
                    break; // No more lost quotes to assign
                }
                const lostQuoteId = shuffledLostQuotes[lostQuoteIndex].id;
                console.log(salesEmployee.id)

                // Update the lost_quote table with the new assignment
                await assignLostQuoteToEmployee(lostQuoteId, salesEmployee.id);

                lostQuoteIndex++;
            }
        }

        console.log('Lost quotes assigned to sales employees successfully.');
    } catch (error) {
        console.error('Assign lost quotes error:', error);
        throw error;
    }
}

function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

async function assignLostQuoteToEmployee(quoteId, employeeId) {
    try {
        // Check if the quote is already assigned to this employee
        const checkExistingAssignmentQuery = 'SELECT * FROM lost_quote WHERE quote_id = ? ';
        const [existingAssignmentRows, _] = await connection.query(checkExistingAssignmentQuery, [quoteId, employeeId]);
        console.log(existingAssignmentRows)
        if (existingAssignmentRows.length <= 0) {
            // Quote is not already assigned, so insert the assignment
            const insertQuery = 'INSERT INTO lost_quote (quote_id, assigned_to_employee) VALUES (?, ?)';
            await connection.query(insertQuery, [quoteId, employeeId]);
            console.log(`Quote ${quoteId} assigned to employee ${employeeId}`);
        } else {
            console.log(`Quote ${quoteId} is already assigned to employee ${employeeId}`);
        }
    } catch (error) {
        console.error('Assign lost quote to employee error:', error);
        throw error;
    }
}





// Export the function to be used in app.js
module.exports = { assignLostQuotesToSalesEmployees };
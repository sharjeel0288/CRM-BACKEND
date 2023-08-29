const mysql = require('mysql2/promise'); // Import promise-based mysql2 library

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "CRM",
  port: "3308",
};

// Create a promise-based pool for MySQL connections
const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10, // Adjust the connection limit as needed
});

// Run the table creation script when the pool is created
(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('CREATE DATABASE IF NOT EXISTS ??', [dbConfig.database]);
    await connection.query('USE ??', [dbConfig.database]);
    // ENUM('Draft', 'Pending', 'Sent', 'Expired', 'Declined', 'Accepted', 'Lost'),
    // NO , pending , accepted, rejected
    // Create the necessary tables if they do not exist
    const createTablesQuery = `

      CREATE DATABASE IF NOT EXISTS CRM;
      
      CREATE TABLE IF NOT EXISTS admin (
        id INT PRIMARY KEY AUTO_INCREMENT,    
        fname VARCHAR(255),
        lname VARCHAR(255),
        password VARCHAR(255),    
        email VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS payment_mode (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        description TEXT,
        is_enabled BOOLEAN,
        is_default BOOLEAN
      );
      

      CREATE TABLE IF NOT EXISTS client (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fname VARCHAR(255),
        lname VARCHAR(255),
        phone VARCHAR(15),
        email VARCHAR(255),
        date DATE,
        added_by_employee INT, -- Employee ID who added the client
        company_name VARCHAR(255)
      );
      
      CREATE TABLE IF NOT EXISTS invoice (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_id INT,
      --  payment_mode_id INT, -- New column for payment mode
        isPerforma INT,
        number VARCHAR(50),
        invoice_current_date DATE,
        status INT,
        expiry_date DATE,
        terms_and_condition TEXT,
        note TEXT,
        payment_terms TEXT,
        execution_time VARCHAR(255),
        bank_details TEXT,
        added_by_employee INT, -- Employee ID who added the invoice
        FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE
        
        
        );
        -- FOREIGN KEY (payment_mode_id) REFERENCES payment_mode(id) 
      

      CREATE TABLE IF NOT EXISTS invoice_item (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoice_id INT,
        item_name VARCHAR(255),
        item_description VARCHAR(255),
        item_quantity INT,
        item_xdim FLOAT,
        item_ydim FLOAT,
        item_price FLOAT,
        item_subtotal FLOAT,
        item_tax FLOAT,
        item_total FLOAT,
        FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS quote (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_id INT,
       -- payment_mode_id INT,
        number VARCHAR(50),
        quote_current_date DATE,
        status INT,
        added_by_employee INT, -- Employee ID who added the quote
        expiry_date DATE,
        terms_and_condition TEXT,
        is_approved_by_admin INT DEFAULT 0,
        note TEXT,
        payment_terms TEXT,
        execution_time VARCHAR(255),
        bank_details TEXT,
        FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE
        );
        --   FOREIGN KEY (payment_mode_id) REFERENCES payment_mode(id) 
      


      CREATE TABLE IF NOT EXISTS quote_item (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quote_id INT,
        item_name VARCHAR(255),
        item_description VARCHAR(255),
        item_quantity INT,
        item_xdim FLOAT,
        item_ydim FLOAT,
        item_price FLOAT,
        item_subtotal FLOAT,
        item_tax FLOAT,
        item_total FLOAT,
        FOREIGN KEY (quote_id) REFERENCES quote(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS employee (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        surname VARCHAR(255),
        birthday DATE,
        department VARCHAR(255),
        position VARCHAR(255),
        phone VARCHAR(15),
        email VARCHAR(255),
        password VARCHAR(255),
        is_deleted BOOLEAN NOT NULL DEFAULT 0
      );
      -- Alter the table to set the AUTO_INCREMENT value
      ALTER TABLE employee AUTO_INCREMENT = 1000000;
     -- ALTER TABLE employee ADD COLUMN ;

      
      CREATE TABLE IF NOT EXISTS setting (
        logo_img VARCHAR(255),
        stamp_img VARCHAR(255),
        name VARCHAR(255),
        address TEXT,
        vat_no VARCHAR(50)
      );
      
    
      CREATE TABLE IF NOT EXISTS payment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoice_id INT,
        date DATE,
        amount FLOAT,
        payment_mode_id INT,
        reference VARCHAR(255),
        description TEXT,
        FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_mode_id) REFERENCES payment_mode(id)
      );
      
      CREATE TABLE IF NOT EXISTS announcement (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        description TEXT,
        employee_id INT,
        priority INT,
        status INT DEFAULT 0,
        FOREIGN KEY (employee_id) REFERENCES employee(id)
    );
    
      CREATE TABLE IF NOT EXISTS lost_quote (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quote_id INT,
        assigned_to_employee INT, -- Employee ID assigned to this lost quote/invoice
        message TEXT,
        isDone INT default 0,
        FOREIGN KEY (quote_id) REFERENCES quote(id) ON DELETE CASCADE,
        -- ON DELETE CASCADE specifies cascading delete
        FOREIGN KEY (assigned_to_employee) REFERENCES employee(id) ON DELETE CASCADE
    );
      `;

    const queries = createTablesQuery.split(';').filter((query) => query.trim() !== '');

    for (const query of queries) {
      await connection.query(query);
    }

    connection.release();
    console.log('Tables created or already exist');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
})();

// Export the pool
module.exports = pool;



var mysql = require("mysql");

var inquirer = require('inquirer');

require('console.table');

var inventoryTable = [];

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: "8889",
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw (err);
    console.log("connected as id " + connection.threadId);
    console.log("Welcome to the Manager Portal of the Bamazon Store!\nWhat would you like to do today?\n");
    managerFunctions();
});

function managerFunctions() {
    inquirer
        .prompt([
            /* Pass your questions in here */
            {
                type: 'rawlist',
                name: 'action',
                message: "Pick a manager duty.",
                choices: ['View Products for Sale',
                    'View Low Inventory',
                    'Add to Inventory',
                    'Add New Product'
                ]
            },
        ])
        .then(function (answer) {

            if (answer.action === 'View Products for Sale') {
                viewProducts();
            } else if (answer.action === 'View Low Inventory') {
                lowInventory();
            } else if (answer.action === 'Add to Inventory') {
                addInventory();
            } else if (answer.action === 'Add New Product') {
                addProduct();
            }
        });
};

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, response) {
        if (err) throw err;
        var productTable = [];
        for (var i = 0; i < response.length; i++) {
            let productObj = {
                itemID: response[i].item_id,
                productName: response[i].product_name,
                price: "$" + response[i].price,
                department: response[i].department_name,
                inventory: response[i].stock_quantity
            };
            productTable.push(productObj);
        };
        console.table(productTable);
        managerFunctions();
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 500", function (err, response) {
        if (err) throw err;
        for (var i = 0; i < response.length; i++) {
            let inventoryObj = {
                itemID: response[i].item_id,
                productName: response[i].product_name,
                price: "$" + response[i].price,
                department: response[i].department_name,
                inventory: response[i].stock_quantity
            };
            inventoryTable.push(inventoryObj);
        };
        console.table(inventoryTable);

        inquirer
        .prompt([{
            type: 'input',
            name: "addinventory",
            message: "Would you like to add inventory items? (y/n)\n"
        }])
        .then(function (answer) {
            var managerResponse = (answer.addinventory).toLowerCase();
            if (managerResponse === "y") {
                addInventory();
            } else if (managerResponse === "n") {
                managerFunctions();
            };
        });
        
    });
}

function addInventory() {
    connection.query("SELECT * FROM products", function (err, response) {
        if (err) throw err;
        var productTable = [];
        for (var i = 0; i < response.length; i++) {
            let productObj = {
                itemID: response[i].item_id,
                productName: response[i].product_name,
                price: "$" + response[i].price,
                department: response[i].department_name,
                inventory: response[i].stock_quantity
            };
            productTable.push(productObj);
        };
        console.table(productTable);

        inquirer
            .prompt([{
                    type: 'input',
                    name: 'addinventory',
                    message: 'Pick a item id to add inventory.',
                },
                {
                    type: 'input',
                    name: 'quantity',
                    message: 'How much would you like to add to inventory?',
                }
            ])
            .then(function (answer) {
                var item = parseInt(answer.addinventory);
                var quantity = parseInt(answer.quantity);
                var itemlocate = null;

                itemlocate = response.find(element => (element.item_id === item));

                if (itemlocate) {
                    connection.query("UPDATE products SET stock_quantity= stock_quantity+? WHERE item_id= ?",
                        [quantity, item])
                    console.log("You added " + quantity + " to the stock quantity.");
                    workMore();

                } else {
                    console.log("Invalid selection, please try again.");
                    addInventory();
                };
            });
    });
};

function addProduct() {
    inquirer
        .prompt([
            /* Pass your questions in here */
            {
                type: 'input',
                name: 'name',
                message: "What's your product name?"
            },
            {
                type: 'input',
                name: 'department',
                message: "What's the product's department?"
            },
            {
                type: 'input',
                name: 'price',
                message: "What's the product's retail price?"
            },
            {
                type: 'input',
                name: 'quantity',
                message: "What is the stock quantity being added?"
            }
        ])
        .then(function (answers) {

            connection.query("INSERT INTO products SET ?", {
                product_name: answers.name,
                department_name: answers.department,
                price: parseFloat(answers.price).toFixed(2),
                stock_quantity: parseInt(answers.quantity)
            }, function (err, response) {
                if (err) throw err;

                console.log("You've have successfully added a new product to inventory. ");
                workMore();
            });
        });
}

function workMore() {
    inquirer
        .prompt([{
            type: 'input',
            name: "workMore",
            message: "Would you like to see the Manager Menu? (y/n)"
        }])
        .then(function (answer) {
            var managerResponse = (answer.workMore).toLowerCase();
            if (managerResponse === "y") {
                managerFunctions();
            } else if (managerResponse === "n") {
                console.log("Thank you for using the Manager Portal of the Bamazon Store!")
                connection.end();
            };
        });
};
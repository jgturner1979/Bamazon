var mysql = require("mysql");

var inquirer = require('inquirer');

require('console.table');

var checkout = [];

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
    console.log("Welcome to the Bamazon Store!\n");
    displayItems();
});

function displayItems() {

    connection.query("SELECT * FROM products", function (err, response) {
        if (err) throw err;
        var productTable = [];
        for (var i = 0; i < response.length; i++) {
            let productObj = {
                itemID: response[i].item_id,
                productName: response[i].product_name,
                price: "$" + response[i].price,
            };
            productTable.push(productObj);
        };
        console.table(productTable);
        purchaseItems(response);
    });
};

function purchaseItems(response) {
    inquirer
        .prompt([
            /* Pass your questions in here */
            {
                type: 'input',
                name: 'action',
                message: "To purchase an item, please type the item id number.",
            },
            {
                type: "input",
                name: "quantity",
                message: "Please enter the purchase quantity.",
            }
        ])
        .then(function (answer) {
            var item = parseInt(answer.action);
            var quantity = parseInt(answer.quantity);

            for (var i = 0; i < response.length; i++) {
                if (response[i].item_id === item) {

                    if (response[i].stock_quantity >= quantity) {
                        connection.query("UPDATE products SET stock_quantity= stock_quantity-? WHERE item_id= ?",
                            [quantity, item]
                        );
                        console.log("Your purchase:\nQuantity: " + quantity + "\nProduct: " + response[i].product_name);
                        checkout.push(response[i].price * quantity).toFixed(2);
                        parseFloat(checkout);
                        console.log("Total cost due at checkout: $" + checkout.reduce(getSum).toFixed(2));
                        continueShopping();
                    } else {
                        console.log("Insufficient quanitity to fulfill your order!");
                        continueShopping();
                    };
                };
            };
        });
};

function continueShopping() {
    inquirer
        .prompt([{
            type: 'input',
            name: "continueShopping",
            message: "Do you want to continue shopping? (y/n)"
        }])
        .then(function (answer) {
            var customerResponse = (answer.continueShopping).toLowerCase();
            if (customerResponse === "y") {
                displayItems();
            } else if (customerResponse === "n") {
                console.log("Thank you for visiting the Bamazon Store!")
                connection.end();
            };
        });
};

function getSum(total, num) {
    return total + num;
};
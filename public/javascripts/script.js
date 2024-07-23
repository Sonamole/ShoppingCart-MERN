// Define a function named addToCart which takes proId (product ID) as an argument
function addToCart(proId) {
    $.ajax({// Use jQuery's ajax function to send an AJAX request
        url: '/add-to-cart/' + proId, // The URL endpoint for the AJAX request.// It dynamically includes the product ID in the URL
        method: 'get',
        success: (response) => {// A function to handle a successful response
            if (response.status) { // Check if the response object has a 'status' property that is true
                let count = $('#cart-count').html(); // Get the current cart count from the HTML element with id 'cart-count'
                count = parseInt(count) + 1;  // Convert the count from a string to an integer and increment it by 1
                $("#cart-count").html(count); // Update the HTML content of the element with id 'cart-count' with the new count
            }
        }
    });
}


// Function to calculate the position of the watermark relative to the main image
function getWatermarkPosition(watermark, container) {
    var watermarkRect = watermark.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();
    return {
        x: watermarkRect.left - containerRect.left,
        y: watermarkRect.top - containerRect.top
    };
}

// allows to move the watermark
document.addEventListener('DOMContentLoaded', function() {
    // Function to add drag functionality to an element
    function makeDraggable(dragTarget, container) {
        var startX, startY, origX, origY, moveListener, endListener;

        function startDrag(e) {
            // Determine start position based on whether it's a touch or mouse event
            var clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

            // Get the initial position of the target
            var rect = dragTarget.getBoundingClientRect();
            startX = clientX;
            startY = clientY;
            origX = rect.left;
            origY = rect.top;

                // Calculate the initial offset of the cursor from the dragTarget's top-left corner
            dragOffsetX = clientX - rect.left;
            dragOffsetY = clientY - rect.top;

            // Define listeners for moving and stopping
            moveListener = e.type.includes('touch') ? 'touchmove' : 'mousemove';
            endListener = e.type.includes('touch') ? 'touchend' : 'mouseup';

            // Attach the listeners to document to handle drag/move
            document.addEventListener(moveListener, onDrag);
            document.addEventListener(endListener, stopDrag);

            // Optional: Prevent text selection or image dragging
            e.preventDefault();
        }

        function onDrag(e) {
            var clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

            // Calculate the new position
            var deltaX = clientX - startX ;
            var deltaY = clientY - startY ;

            var containerRect = container.getBoundingClientRect();
            var maxX = containerRect.width - dragTarget.offsetWidth;
            var maxY = containerRect.height - dragTarget.offsetHeight;

            // Apply the movement and constraints
            var newX = Math.min(Math.max(origX + deltaX - containerRect.left, 0), maxX);
            var newY = Math.min(Math.max(origY + deltaY - containerRect.top, 0), maxY);

            dragTarget.style.left = newX + 'px';
            dragTarget.style.top = newY + 'px';
        }

        function stopDrag() {
            // Remove the move and end listeners when dragging stops
            document.removeEventListener(moveListener, onDrag);
            document.removeEventListener(endListener, stopDrag);
        }

        // Attach the start listener for both touch and mouse
        dragTarget.addEventListener('mousedown', startDrag);
        dragTarget.addEventListener('touchstart', startDrag);
    }

    // Get the main image, watermarks, and container
    var imageContainer = document.getElementById('image-container'); 
    var imageWatermark = document.getElementById('image-watermark');
    var textWatermark = document.getElementById('text-watermark');

    // Apply the drag functionality
    makeDraggable(imageWatermark, imageContainer);
    makeDraggable(textWatermark, imageContainer);
});


// by pushing the button updates the position data
document.getElementById('get-position-btn').addEventListener('click', function clickEventHandler() {
    var mainImage = document.getElementById('main-image');
    var imageWatermark = document.getElementById('image-watermark'); 
    var textWatermark = document.getElementById('text-watermark')// Or textWatermark for the <p> element
    var position = getWatermarkPosition(imageWatermark, mainImage);
    position.x = Math.floor(position.x);
    position.y = Math.floor(position.y);
    var text_position = getWatermarkPosition(textWatermark, mainImage);
    console.log('Watermark Position:', position);
    document.getElementById('num').textContent = 'watermark position ' + ' x ' + position.x + ' y ' +position.y;
    document.getElementById('tnum').textContent = 'text '+ 'x '+ text_position.x + ' y '+ text_position.y
    fetch('/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            watermark_pos: position,
            text_pos: text_position,
        })
        
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Process the response if it's in JSON format
    })
    .then(data => {
        console.log(data); // Handle the data from the response
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
});

// scales the watermark
const watermark = document.getElementById('image-watermark');
let initialDistance = null;
let scale = 1; // Initial scale
let reqAnimationId = null;

// Function to calculate the distance between two touch points
function getDistance(touches) {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Throttle function to limit the rate of function execution
function throttle(callback, delay) {
    let last;
    let deferTimer;
    return function() {
        let now = Date.now();
        let args = arguments;
        if (last && now < last + delay) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function() {
                last = now;
                callback.apply(this, args);
            }, delay);
        } else {
            last = now;
            callback.apply(this, args);
        }
    };
}

// Enhanced touchmove handler with requestAnimationFrame and throttling
const handleTouchMove = throttle(function(e) {
    if (e.touches.length === 2 && initialDistance != null) {
        const distance = getDistance(e.touches);
        const newScale = distance / initialDistance;
        scale = newScale; 
        console.log(scale)// Update the global scale variable
        if (reqAnimationId) {
            cancelAnimationFrame(reqAnimationId);
        }
        reqAnimationId = requestAnimationFrame(() => {
            watermark.style.transform = `scale(${scale})`;
        });
    }
}, 50); // Throttle delay of 50ms

watermark.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches);
    }
}, { passive: false });

watermark.addEventListener('touchmove', handleTouchMove, { passive: false });

watermark.addEventListener('touchend', function(e) {
    if (e.touches.length < 2) {
        initialDistance = null; // Reset initial distance
    }
});


// Function to calculate the position of the watermark relative to the main image
function getWatermarkPosition(watermark, container) {
    var watermarkRect = watermark.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();
    return {
        x: watermarkRect.left - containerRect.left,
        y: watermarkRect.top - containerRect.top
    };
}

// allows to move and scale the watermark

document.addEventListener('DOMContentLoaded', function() {
    const watermark = document.getElementById('image-watermark');
    const container = document; // Using document as the container for simplicity, adjust as needed
    
    let initialDistance = null;
    let scale = 1; // Initial scale for pinch-to-zoom
    let isDragging = false; // Track if we are in drag mode

    // Function to calculate the distance between two touch points for pinch-to-zoom
    function getDistance(touch1, touch2) {
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Throttle function to limit the rate of function execution
    function throttle(callback, delay) {
        let last;
        let timer;
        return function(...args) {
            const context = this;
            const now = Date.now();
            if (last && now < last + delay) {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    last = now;
                    callback.apply(context, args);
                }, delay);
            } else {
                last = now;
                callback.apply(context, args);
            }
        };
    }

    // Add drag functionality
    function makeDraggable(dragTarget) {
        let startX, startY, offsetX, offsetY, isDragging = false;
    
        function startDrag(e) {
            // Prevent initiating drag if we are scaling or if more than one touch is detected
            if (e.touches && e.touches.length > 1) return;
    
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
            // Get the initial position of the dragTarget relative to the viewport
            const rect = dragTarget.getBoundingClientRect();
            startX = clientX;
            startY = clientY;
    
            // Calculate the offset from the cursor/finger to the top-left corner of the dragTarget
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
    
            // Attach event listeners for moving and stopping the drag
            document.addEventListener('mousemove', onDrag, {passive: false});
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', onDrag, {passive: false});
            document.addEventListener('touchend', stopDrag);
    
            isDragging = true;
            e.preventDefault(); // Prevent text selection or other default actions
        }
    
        function onDrag(e) {
            if (!isDragging) return;
    
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
            // Include page scroll offsets in the calculation for absolute positioning relative to the document
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
            // Use startX/Y, offsetX/Y to maintain the initial offset between the touch point and the element's original position
            const newX = clientX - offsetX + scrollX;
            const newY = clientY - offsetY + scrollY;
    
            // Apply the calculated position
            dragTarget.style.position = 'absolute'; // Ensure the position is absolute
            dragTarget.style.left = newX + 'px';
            dragTarget.style.top = newY + 'px';
    
            e.preventDefault(); // This line is optional, based on whether you need to prevent default behavior during drag
        }
    
        function stopDrag() {
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('touchend', stopDrag);
    
            isDragging = false;
        }
    
        // Attach the initial listener for both mouse and touch start
        dragTarget.addEventListener('mousedown', startDrag);
        dragTarget.addEventListener('touchstart', startDrag);
    }
    

    // Initialize draggable functionality
    makeDraggable(watermark);

    // Pinch-to-zoom functionality
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchmove', throttle(function(e) {
        if (e.touches.length === 2 && initialDistance) {
            const newDistance = getDistance(e.touches[0], e.touches[1]);
            const newScale = (newDistance / initialDistance) * scale;
            watermark.style.transform = `scale(${newScale})`;
            e.preventDefault();
        }
    }, 50), { passive: false });

    document.addEventListener('touchend', function(e) {
        if (e.touches.length < 2 && initialDistance) {
            scale = parseFloat(watermark.style.transform.slice(6, -1)) || 1;
            initialDistance = null; // Reset initial distance for pinch-to-zoom
        }
    });
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


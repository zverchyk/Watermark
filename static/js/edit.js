
// Function to calculate the position of the watermark relative to the main image
function getWatermarkPosition(watermark, container) {
    var watermarkRect = watermark.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();
    return {
        x: watermarkRect.left - containerRect.left,
        y: watermarkRect.top - containerRect.top
    };
}


// MOVE AND SCALE WITH TOUCH

document.addEventListener('DOMContentLoaded', function() {
    const watermark = document.getElementById('image-watermark');
    const container = document.getElementById('main-image'); // Using document as the container for simplicity, adjust as needed
    
    let initialDistance = null;
    window.scale = 1; // Initial scale for pinch-to-zoom
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
function makeDraggable(dragTarget, container) {
    let startX, startY, offsetX, offsetY, isDragging = false;

    function startDrag(e) {
        // Prevent initiating drag if more than one touch is detected or we are scaling
        if (e.touches && e.touches.length > 1) return;

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const rect = dragTarget.getBoundingClientRect();

        // Calculate the offset from the cursor/finger to the top-left corner of the dragTarget
        startX = clientX;
        startY = clientY;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        // Attach event listeners for moving and stopping the drag
        document.addEventListener('mousemove', onDrag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);

        isDragging = true;
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging) return;

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        // Include page scroll offsets in the calculation for absolute positioning relative to the document
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Calculate new position considering the initial offsets
        let newX = clientX - offsetX + scrollX;
        let newY = clientY - offsetY + scrollY;

        // Container (background picture) dimensions and position
        const containerRect = container.getBoundingClientRect();

        // Apply constraints: Allow the watermark to slightly go out of the background picture by 30px
        const minX = containerRect.left + scrollX - 30; // 30px outside to the left
        const maxX = containerRect.right + scrollX - dragTarget.offsetWidth + 30; // 30px outside to the right
        const minY = containerRect.top + scrollY - 30; // 30px outside to the top
        const maxY = containerRect.bottom + scrollY - dragTarget.offsetHeight + 30; // 30px outside to the bottom

        // Constrain newX and newY within the min and max values
        newX = Math.min(Math.max(newX, minX), maxX);
        newY = Math.min(Math.max(newY, minY), maxY);

        dragTarget.style.position = 'absolute'; // Ensure the position is absolute
        dragTarget.style.left = newX + 'px';
        dragTarget.style.top = newY + 'px';

        e.preventDefault();
    }

    function stopDrag() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', stopDrag);

        isDragging = false;
    }

    // Attach the start listener for both mouse and touch start
    dragTarget.addEventListener('mousedown', startDrag);
    dragTarget.addEventListener('touchstart', startDrag);
}


    // Initialize draggable functionality
    makeDraggable(watermark, container);

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



//  MOVE AND SCALE WITH MOUSE

document.addEventListener('DOMContentLoaded', function() {
    const watermark = document.getElementById('image-watermark');
    const scaleHandles = document.getElementsByClassName('scale-handle');
    let isResizing = false;
    let isDragging = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    // Function to initialize dragging
    function startDrag(e) {
        // Prevent interaction if resizing is active
        if (isResizing) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = watermark.offsetLeft;
        startTop = watermark.offsetTop;

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }

    // Function to perform dragging
    function doDrag(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
    
        // Assuming 'container' is already defined and accessible in your scope
        const container = document.getElementById('image-container');
        const containerRect = container.getBoundingClientRect();
    
        // Including window's scroll offsets
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
    
        // Calculate the new position including the drag distance
        let newX = startLeft + dx;
        let newY = startTop + dy;
    
        // Constrain the new position to allow the watermark to go slightly out of the main container by 30px
        const minX = containerRect.left + scrollX - 30;
        const maxX = containerRect.right + scrollX - watermark.offsetWidth + 30;
        const minY = containerRect.top + scrollY - 30;
        const maxY = containerRect.bottom + scrollY - watermark.offsetHeight + 30;
    
        // Apply the constraints to newX and newY
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));
    
        // Update the watermark's position with the constrained values
        watermark.style.left = `${newX}px`;
        watermark.style.top = `${newY}px`;
    }

    // Function to stop dragging
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // Attach the mousedown event to the watermark for dragging
    watermark.addEventListener('mousedown', startDrag);

    // Function to initialize resizing
    function initResize(e) {
        // Prevent default actions and stop event propagation
        e.preventDefault();
        e.stopPropagation();

        isResizing = true;
        const handleId = e.target.id;
        startX = e.clientX;
        startY = e.clientY;
        const rect = watermark.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = watermark.offsetLeft;
        startTop = watermark.offsetTop;

        document.addEventListener('mousemove', resizeElement);
        document.addEventListener('mouseup', stopResize);

        function resizeElement(e) {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            let width = Math.max(10, startWidth - dx);
            let height = Math.max(10, startHeight - dy);
            window.width
            window.heiht
            switch(handleId) {
                case 'scale-top-left':
                    watermark.style.width = `${width}px`;
                    watermark.style.height = `${height}px`;
                    watermark.style.left = `${startLeft + dx}px`;
                    watermark.style.top = `${startTop + dy}px`;
                    break;
                case 'scale-top':
                    watermark.style.height = `${height}px`;
                    watermark.style.top = `${startTop + dy}px`;
                    break;
                case 'scale-top-right':
                    watermark.style.width = `${Math.max(10, startWidth + dx)}px`;
                    watermark.style.height = `${height}px`;
                    watermark.style.top = `${startTop + dy}px`;
                    break;
                case 'scale-right':
                    watermark.style.width = `${Math.max(10, startWidth + dx)}px`;
                    break;
                case 'scale-bottom-right':
                    watermark.style.width = `${Math.max(10, startWidth + dx)}px`;
                    watermark.style.height = `${Math.max(10, startHeight + dy)}px`;
                    break;
                case 'scale-bottom':
                    watermark.style.height = `${Math.max(10, startHeight + dy)}px`;
                    break;
                case 'scale-bottom-left':
                    watermark.style.width = `${width}px`;
                    watermark.style.height = `${Math.max(10, startHeight + dy)}px`;
                    watermark.style.left = `${startLeft + dx}px`;
                    break;
                case 'scale-left':
                    watermark.style.width = `${width}px`;
                    watermark.style.left = `${startLeft + dx}px`;
                    break;
            }
            
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resizeElement);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    // Attach mousedown event to all scale handles for resizing
    Array.from(scaleHandles).forEach(handle => {
        handle.addEventListener('mousedown', initResize);
    });
});

// SENDS DATA TO SERVER
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
            size: scale,
a
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
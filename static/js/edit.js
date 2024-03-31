// Function to calculate the position of the watermark relative to the main image
function getWatermarkPosition(watermark, container) {
    var watermarkRect = watermark.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();

    return {
        x: watermarkRect.left - containerRect.left,
        y: watermarkRect.top - containerRect.top,

    };
}

const watermark = document.getElementById('image-watermark');
// Scale properties 
let ScaleObject = {
    water_width: watermark.style.width,
    water_height: watermark.style.height,
}

// MOVE AND SCALE WITH TOUCH

document.addEventListener('DOMContentLoaded', function() {
    
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
    let startX, startY, startLeft, startTop, isDragging = false;
    const rect = dragTarget.getBoundingClientRect();
    function startDrag(e) {
        // Prevent initiating drag if more than one touch is detected or we are scaling
        if (e.touches && e.touches.length > 1) return;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startLeft = watermark.offsetLeft;
        startTop = watermark.offsetTop;
        
        // Attach event listeners for moving and stopping the drag
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);

        isDragging = true;
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging) return;

        dx = e.touches[0].clientX - startX
        dy = e.touches[0].clientY - startY

        // Calculate new position considering the initial offsets
        let newX = startLeft +dx;
        let newY = startTop + dy;

        // Container (background picture) dimensions and position
        const containerRect = container.getBoundingClientRect();

        // Apply constraints: Allow the watermark to slightly go out of the background picture by 30px
        const minX = - 30; // 30px outside to the left
        const maxX = containerRect.width  - dragTarget.offsetWidth + 30; // 30px outside to the right
        const minY = - 30; // 30px outside to the top
        const maxY = containerRect.height - dragTarget.offsetHeight + 30; // 30px outside to the bottom

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
            ScaleObject.water_width = watermark.style.width
            ScaleObject.water_height = watermark.style.height
        }
    });
});



//  MOVE AND SCALE WITH MOUSE

document.addEventListener('DOMContentLoaded', function() {
    const scaleHandles = document.getElementsByClassName('scale-handle');
    const rotateHandle = document.getElementById("rotation")
    let isResizing = false;
    let isDragging = false;
    let isRotating = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    // Rotation function

        
    const calculateRotation = (e) => {
        const rect = watermark.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const angleDeg = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
        return angleDeg;
    };
    function startRotate(e){
        isRotating = true;
        document.addEventListener('mousemove', doRotate);
        document.addEventListener('mouseup', stopRotate);
    }
    function doRotate(e){
        if(!isRotating) return;
        const angle = calculateRotation(e);
        watermark.style.transform = `rotate(${angle}deg)`;
        console.log(angle)
        document.addEventListener('mouseup', stopRotate);
    }
    function stopRotate(e){
        isRotating = false;
        document.addEventListener('mousemove', doRotate);
        document.addEventListener('mouseup', stopRotate);
    }



    // Function to initialize dragging
    function startDrag(e) {
        // Prevent interaction if resizing is active
        if (isResizing) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = watermark.offsetLeft;
        startTop = watermark.offsetTop;
        // console.log("startLeft", startLeft)
        // console.log("startTOP", startTop)
        // console.log("startx: ", startX)

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
        // const scrollX = window.scrollX;
        // const scrollY = window.scrollY;
    
        // Calculate the new position including the drag distance
        let newX = startLeft + dx;
        let newY = startTop + dy;
    
        // Constrain the new position to allow the watermark to go slightly out of the main container by 30px
        const minX = -30;
        const maxX = containerRect.width - watermark.offsetWidth + 30;
        const minY = -30;
        const maxY = containerRect.height - watermark.offsetHeight + 30;
        
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
    rotateHandle.addEventListener('mousedown', startRotate);
    // Function to initialize resizing
    function initResize(e) {
        // Prevent default actions and stop event propagation
        e.preventDefault();
        e.stopPropagation();

        isResizing = true;
        const handleId = e.target.id;
        startX = e.clientX;
        startY = e.clientY;
        rect = watermark.getBoundingClientRect();
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
            

            switch(handleId) {
                case 'scale-top-left':
                    watermark.style.width = `${Math.max(10, startWidth - dx)}px`;
                    watermark.style.height = `${Math.max(10, startHeight - dy)}px`;
                    watermark.style.left = `${startLeft + dx}px`;
                    watermark.style.top = `${startTop + dy}px`;
                    ScaleObject.water_width = watermark.style.width
                    ScaleObject.water_height = watermark.style.height
                    
                    break;
                case 'scale-top':
                    watermark.style.height = `${Math.max(10, startHeight - dy)}px`;
                    watermark.style.top = `${startTop + dy}px`;
                    ScaleObject.water_height = watermark.style.height
                    break;
                case 'scale-top-right':
                    watermark.style.width = `${Math.max(10, startWidth + dx)}px`;
                    watermark.style.height = `${Math.max(10, startHeight - dy)}px`;
                    watermark.style.top = `${startTop + dy}px`;
                    ScaleObject.water_width = watermark.style.width
                    ScaleObject.water_height = watermark.style.height
                    break;
                case 'scale-right':
                    watermark.style.width = `${Math.max(10, startWidth + dx)}px`;
                    ScaleObject.water_width = watermark.style.width
                    break;
                case 'scale-bottom-right':
                    watermark.style.width = `${Math.max(10, startWidth + dx)}px`;
                    watermark.style.height = `${Math.max(10, startHeight + dy)}px`;
                    ScaleObject.water_width = watermark.style.width
                    ScaleObject.water_height = watermark.style.height
                    break;
                case 'scale-bottom':
                    watermark.style.height = `${Math.max(10, startHeight + dy)}px`;
                    ScaleObject.water_height = watermark.style.height
                    break;
                case 'scale-bottom-left':
                    watermark.style.width = `${Math.max(10, startWidth - dx)}px`;
                    watermark.style.height = `${Math.max(10, startHeight + dy)}px`;
                    watermark.style.left = `${startLeft + dx}px`;
                    ScaleObject.water_width = watermark.style.width
                    ScaleObject.water_height = watermark.style.height
                    break;
                case 'scale-left':
                    watermark.style.width = `${Math.max(10, startWidth - dx)}px`;
                    watermark.style.left = `${startLeft + dx}px`;
                    ScaleObject.water_width = watermark.style.width
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
    var mainImageSize = mainImage.getBoundingClientRect();
    var position = getWatermarkPosition(imageWatermark, mainImage);
    position.x = Math.floor(position.x);
    position.y = Math.floor(position.y);

    
 fetch('/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            watermark_pos: position,
            watermarkWidth: ScaleObject.water_width,
            watermarkHeight: ScaleObject.water_height,
            mainImageWidth: mainImageSize.width,
            mainImageHeight: mainImageSize.height,


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
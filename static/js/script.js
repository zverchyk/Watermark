document.addEventListener("DOMContentLoaded", function() {
    // Function to handle file selection and preview
    function handleFileSelection(event, fileNameElementId, previewElementId) {
        var file = event.target.files[0];
        if (!file) {
            document.getElementById(fileNameElementId).textContent = 'No file selected';
            var preview = document.getElementById(previewElementId);
            preview.src = "";
            preview.style.display = 'none';
            return;
        }

        // Update the file name
        document.getElementById(fileNameElementId).textContent = ':) ' + file.name;

        // Show the preview
        var reader = new FileReader();
        reader.onloadend = function() {
            var preview = document.getElementById(previewElementId);
            preview.src = reader.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }

    // Attach the event listener to picture input
    document.getElementById('picture').addEventListener('change', function(event) {
        handleFileSelection(event, 'pic-name', 'main-image');
    });

    // Attach the event listener to watermark input
    document.getElementById('watermark').addEventListener('change', function(event) {
        handleFileSelection(event, 'water-name', 'image-watermark-inner'); // Make sure to have a corresponding 'water-preview' ID for your watermark preview image
    });
});

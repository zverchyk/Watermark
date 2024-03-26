from flask import Flask, url_for, render_template, redirect,json, request, send_file, session, jsonify
import os
from watermark import Watermark
import tempfile
from werkzeug.utils import secure_filename
add_watermark = Watermark()
app = Flask(__name__)

app.config['SECRET_KEY'] = 'SECRET_KEY'

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    result = session.get('result', False)

    if request.method == 'POST':
        # Check if the post request has the file part
        if 'picture' not in request.files:
            return 'No file part'
        picture = request.files['picture']
        watermark = request.files['watermark']
        position = (0,0)
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if picture.filename == '':
            return 'No selected file'
        if picture and watermark:
            file_ext = os.path.splitext(secure_filename(picture.filename))[1]
            watermark_ext = os.path.splitext(secure_filename(watermark.filename))[1]
            
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_picture, \
             tempfile.NamedTemporaryFile(delete=False, suffix=watermark_ext) as temp_watermark:
                 
                picture.save(temp_picture.name)
                watermark.save(temp_watermark.name)
         
                add_watermark.get_result(temp_picture.name, temp_watermark.name, position)

                # # Clean up the temporary and processed files
                # os.unlink(temp_picture.name)
                # os.unlink(temp_watermark.name)

                session['result'] = True
                return redirect(url_for('upload_file'))

        return 'No files uploaded', 400
    return render_template('index.html', result = result, filepath = 'result/result.png')

@app.route('/download-image', methods=['GET'])
def download_image():
    image_path = "result\\result.png"  # Specify the path to the image
    session['result'] = False
    return send_file(image_path, as_attachment=True, download_name='downloaded_image.png')

@app.route('/edit', methods=["GET", "POST"])
def edit():
    data = None
    if request.method == "POST":
        print('helo')
        data = request.get_json()
        print(data)
        return jsonify(data)
    return render_template('edit.html', data = json.dumps(data))

if __name__ == "__main__":
    app.run(debug=True)
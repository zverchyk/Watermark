from PIL import Image, ImageOps


class Watermark():
    
    def merge_with_transparency(self,background_image_path, watermark_path,position,  **kwargs):
        with Image.open(watermark_path) as img:
            ImageOps.cover(img, (250, 250)).save(watermark_path)
        # Open the background and transparent images
        background = Image.open(background_image_path).convert("RGBA")
        watermark = Image.open(watermark_path).convert("RGBA")
    
        # Create a new blank image with the same size as the background
        merged_image = Image.new("RGBA", background.size)
        try:
            
            watermark_width = kwargs.get('width', watermark.width)
            watermark_height= kwargs.get('height', watermark.width)
            
            resized_watermark = watermark.resize((watermark_width, watermark_height))
        except TypeError:
            pass
        else:
            watermark = resized_watermark
        # Paste the background image onto the blank image
        merged_image.paste(background, (0,0))
        # Paste the transparent image onto the merged image at the specified position
        # The transparent image itself is used as the mask to maintain its transparency
        merged_image.paste(watermark,position, mask=watermark)

        return merged_image
    
    def get_result(self, image, watermark, position, width = None, height = None):
        result = self.merge_with_transparency(image, watermark, position, width = width, height = height)
        result.save('result/result.png', "PNG")
        return 'result/result.png'


# img_path = 'static\test_files\changed_1.jpg'
# water_path = 'test_files\watermark.png'

# with Image.open(img_path) as img:
#     print(img.size)



# with Image.open(f'{pic_path}') as img:
#     print(img.format, f"{img.size}x{img.mode}")
#     box = (100, 100, 400, 400)
#     region = img.crop(box)
#     # region.save('croped.jpeg', "JPEG")
#     region = region.transpose(Image.Transpose.ROTATE_180)
#     img.paste(region, box)
#     img.save('raw_pictures/changed_1.jpg', "JPEG")

# BACKGROUND_COLOR = "#FFFFFF"
# back_img = 'raw_pictures/changed_1.jpg'
# screen = Tk()

# screen.config(padx=50, pady=50, bg=BACKGROUND_COLOR)
# photo = Canvas(width=800, height=526, highlightthickness=0, bg=BACKGROUND_COLOR)
# photo_img = photo.create_image(400, 263, image=back_img)
# photo.grid(row=0, column=0, columnspan=2)


# upload_button = Button(bg="#B1DDC6")
# upload_button.create_text()

# screen.mainloop()




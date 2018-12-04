# Text GIF Generator

## Dependencies

You need to install these dependencies

- Node `brew install node`
- ImageMagick `brew install imagemagick`
- Ghostscript `brew install ghostscript`

## Usage

Just execute the following command and follow the instructions:

- `node text_gif_generator.js`

# Adding more 'font backgrounds'

Just add some images to the folder called `backgrounds`. You can even put them in subfolders if you'd like.

# Adding more background colors

Just add some more colors to the `COLORS` array in the `text_gif_generator.js` script. You can find some colors [here](https://imagemagick.org/script/color.php)

## Example

![Alt Text](https://github.com/ErikAlfredsson/text-gif-generator/blob/master/example.gif)

## Troubleshooting

If you see an error similar to this:
`convert: unable to read font (null) @ error/annotate.c/RenderFreetype...`

It's probably because ImageMagick can't find the font you're trying to use.

To fix this:

- Create an ImageMagick configuration folder `mkdir ~/.magick`
- Download this [Pearl script](https://www.imagemagick.org/Usage/scripts/imagick_type_gen)
- Make the script executable: `chmod +x [PATH/TO/SCRIPT.pl]`
- Run the script locally and redirect the output to the file type.xml in ~/.magick: `[PATH/TO/SCRIPT.pl] > ~/.magick/type.xml`

## License

Copyright 2018 Erik Alfredsson

https://creativecommons.org/licenses/by-nc-sa/4.0/

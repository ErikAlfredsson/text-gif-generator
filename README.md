# Text GIF Generator

## Dependencies

You need to install these dependencies

- Node `brew install node`
- ImageMagick `brew install imagemagick`
- Ghostscript `brew install ghostscript`

## Run

Just execute the following command and follow the instructions:

- `node text_gif_generator.js`

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

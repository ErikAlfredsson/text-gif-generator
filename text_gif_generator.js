var exec = require('child_process').exec;

/* VARIABLES */

const RANDOM = true;
const SPEED = 13; // in ms
const SIZE = 1000; // resolution in pixels
const FONT_SIZE = SIZE * 0.9; // points NOT BEING USED RIGHT NOW. IF YOU WANT TO USE ADD -pointSize ${FONT_SIZE} WHEN CREATING CHARACTER IMAGE
const BACKGROUND_COLOR = 'pink'; // in text (haha), could probably be hex somehow
const FONT_COLOR = 'lightgreen'; // in text (haha), could probably be hex somehow
const STROKE_WIDTH = 2;
const STROKE_COLOR = 'white';

/* CONSTANTS */

const OUTPUT_DIR = 'output';
const SPACE_IMAGE_NAME = `${OUTPUT_DIR}/blank.gif`;
const OUTPUT_GIF_NAME = 'output';
const BACKGROUND_DIR = 'backgrounds';
const BACKGROUND_NAME = 'background1.jpg';
const BACKGROUND_RESIZED_NAME = 'background_resized.gif';

/* COMMAND LINE */

async function sh(cmd) {
  return new Promise(function(resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/* EARLY EXIT THING */

const args = process.argv.slice(2);
const inputString = args[0];

if (!inputString) {
  console.log(
    '\n\nYou need to pass in a string as an argument like this:\n\nnode text_generator.js "hi how are you?"\n\nGive it a go!\n\n'
  );
  return;
}

/* MAIN */
const words = inputString.split(' ');
const names = [];
const promises = [sh(`convert -size ${SIZE}x${SIZE} canvas:${BACKGROUND_COLOR} ${SPACE_IMAGE_NAME}`)];
const resizedBackgroundName = `${OUTPUT_DIR}/${BACKGROUND_RESIZED_NAME}`;

function createGIF(backgroundPath) {
  // SOME 'PADDING' BEFORE STARTING
  names.push(SPACE_IMAGE_NAME, SPACE_IMAGE_NAME);

  words.forEach((word, wordIndex) => {
    const characters = word.split('');

    characters.forEach(async (c, index) => {
      console.log('.');

      const name = `${OUTPUT_DIR}/${wordIndex}_${index}.gif`;

      promises.push(
        sh(
          `convert -size ${SIZE}x${SIZE} \
        xc:${BACKGROUND_COLOR} \
        -font Trebuchet \
        -pointSize ${FONT_SIZE} \
        -tile ${resizedBackgroundName} \
        -fill ${FONT_COLOR} \
        -stroke ${STROKE_COLOR} \
        -strokewidth ${STROKE_WIDTH} \
        -gravity center \
        -draw "text 0,0 '${c.toUpperCase()}'" \
        ${name}`
        )
      );

      names.push(name, SPACE_IMAGE_NAME);
    });

    names.push(SPACE_IMAGE_NAME, SPACE_IMAGE_NAME);
  });

  Promise.all(promises).then(async () => {
    const imageNames = names.join(' ');

    console.log('\nCreating gif...');
    // CREATE GIF
    await sh(`convert -loop 0 -delay ${SPEED} ${imageNames} ${OUTPUT_DIR}/${OUTPUT_GIF_NAME}.gif`);

    console.log('\nCleaning up mess...');
    // CLEANUP
    await sh(`rm -rf ${imageNames}`);
    await sh(`rm ${resizedBackgroundName}`);
    console.log(`\nDone! Now grab the gif called ${OUTPUT_GIF_NAME}.gif in the ${OUTPUT_DIR} folder`);
  });
}

async function resizeBackground(backgroundPath) {
  const { stdout } = await sh(`identify -ping -format '%w %h' ${backgroundPath || BACKGROUND_NAME}`);
  const size = stdout.split(' ');
  const width = size[0];
  const height = size[1];

  await sh(`convert ${backgroundPath} -resize ${SIZE}x${SIZE} ${resizedBackgroundName}`);
}

async function selectBackground() {
  const { stdout } = await sh('a=(backgrounds/*.jpg); echo ${a[$((RANDOM % ${#a[@]}))]}');
  return stdout.replace(/\n/g, '');
}

if (RANDOM) {
  selectBackground()
    .then(backgroundPath => resizeBackground(backgroundPath))
    .then(() => createGIF());
} else {
  resizeBackground().then(() => createGIF());
}

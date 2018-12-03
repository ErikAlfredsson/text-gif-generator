var exec = require('child_process').exec;

/* VARIABLES */

const SPEED = 15; // in ms
const SIZE = 1000; // resolution in pixels
const FONT_SIZE = SIZE * 0.9; // points NOT BEING USED RIGHT NOW. IF YOU WANT TO USE ADD -pointSize ${FONT_SIZE} WHEN CREATING CHARACTER IMAGE
const BACKGROUND_COLOR = 'black'; // in text (haha), could probably be hex somehow
const FONT_COLOR = 'lightgreen'; // in text (haha), could probably be hex somehow
const STROKE_WIDTH = 5;
const STROKE_COLOR = 'white';

/* CONSTANTS */

const OUTPUT_DIR = 'output';
const SPACE_IMAGE_NAME = `${OUTPUT_DIR}/blank.gif`;
const OUTPUT_GIF_NAME = 'output';

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

// SOME 'PADDING' BEFORE STARTING
names.push(SPACE_IMAGE_NAME, SPACE_IMAGE_NAME);

words.forEach((word, wordIndex) => {
  const characters = word.split('');

  characters.forEach(async (c, index) => {
    console.log('.');

    const name = `${OUTPUT_DIR}/${wordIndex}_${index}.gif`;
    // label:${c.toUpperCase()}
    // -annotate +0+${SIZE} '${c.toUpperCase()}'
    promises.push(
      sh(
        `convert -size ${SIZE}x${SIZE} \
        xc:${BACKGROUND_COLOR} \
        -font Trebuchet \
        -pointSize ${FONT_SIZE} \
        -tile background.jpg \
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
  console.log(`\nDone! Now grab the gif called ${OUTPUT_GIF_NAME}.gif in the ${OUTPUT_DIR} folder`);
});

// convert -loop 0 -delay 10 flux_0.png flux_30.png flux_60.png flux_90.png flux_120.png flux_150.png flux_180.png flux_210.png flux_240.png flux_270.png flux_300.png flux_330.png output.gif

var exec = require('child_process').exec;

/* VARIABLES */

const RANDOM = true;
const SPEED = 13; // in ms
const SIZE = 500; // resolution in pixels
const FONT_SIZE = SIZE * 0.9; // points NOT BEING USED RIGHT NOW. IF YOU WANT TO USE ADD -pointSize ${FONT_SIZE} WHEN CREATING CHARACTER IMAGE
const BACKGROUND_COLOR = 'pink'; // in text (haha), could probably be hex somehow
const FONT_COLOR = 'lightgreen'; // in text (haha), could probably be hex somehow
const STROKE_WIDTH = 2;
const STROKE_COLOR = 'white';

/* CONSTANTS */

const OUTPUT_DIR = 'output';
const SPACE_IMAGE_NAME = `${OUTPUT_DIR}/blank.gif`;
const OUTPUT_GIF_NAME = 'output.gif';
const BACKGROUND_DIR = 'backgrounds';
const BACKGROUND_NAME = `${BACKGROUND_DIR}/800px_COLOURBOX25785234.jpg`;
const BACKGROUND_RESIZED_NAME = 'background_resized.gif';
const COLORS = [
  'Pink',
  'Black',
  'LightGreen',
  'LightBlue',
  'Purple',
  'White',
  'LightYellow',
  'FireBrick1',
  'SlateGray2',
];

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

/* HELPER */

function numberedList(array) {
  return array.map((name, index) => `${index}. ${name}`).join('\n');
}

/* MAIN */

const names = [];
const promises = [];
const resizedBackgroundName = `${OUTPUT_DIR}/${BACKGROUND_RESIZED_NAME}`;

function createImage(text, backgroundColor, offsetY) {
  console.log('.');

  // kind-of-random name
  const imageName =
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9);
  const name = `${OUTPUT_DIR}/${imageName}.gif`;

  promises.push(
    sh(
      `convert -size ${SIZE}x${SIZE} \
      xc:${backgroundColor} \
      -font Trebuchet \
      -pointSize ${FONT_SIZE} \
      -tile ${resizedBackgroundName} \
      -fill ${FONT_COLOR} \
      -stroke ${STROKE_COLOR} \
      -strokewidth ${STROKE_WIDTH} \
      -gravity center \
      -draw "text 0,${offsetY || '0'} '${text.toUpperCase()}'" \
      ${name}`
    )
  );

  names.push(name, SPACE_IMAGE_NAME);
}

function createGIF(backgroundPath, backgroundColor, text) {
  const words = text.split(' ');

  promises.push(sh(`convert -size ${SIZE}x${SIZE} canvas:${backgroundColor} ${SPACE_IMAGE_NAME}`));

  // SOME 'PADDING' BEFORE STARTING
  names.push(SPACE_IMAGE_NAME, SPACE_IMAGE_NAME);

  words.forEach((word, wordIndex) => {
    const characters = word.split('');
    const smiley = /:\)|:-\)|:\(|:-\(|;\);-\)|:-O|8-|:P|:D|:\||:S|:\$|:@|8o\||\+o\(|\(H\)|\(C\)|\(\?\)/g.exec(word);

    if (smiley) {
      createImage(word, backgroundColor, SIZE * 0.425);
    } else {
      characters.forEach(async (c, index) => {
        const name = `${wordIndex}_${index}`;
        createImage(c, backgroundColor);
      });
    }

    names.push(SPACE_IMAGE_NAME, SPACE_IMAGE_NAME);
  });

  return Promise.all(promises).then(async () => {
    const imageNames = names.join(' ');

    console.log('\nCreating gif...');
    // CREATE GIF
    await sh(`convert -loop 0 -delay ${SPEED} ${imageNames} ${OUTPUT_DIR}/${OUTPUT_GIF_NAME}`);

    console.log('\nCleaning up mess...');
    // CLEANUP
    await sh(`rm -rf ${imageNames}`);
    await sh(`rm ${resizedBackgroundName}`);
    console.log(`\nDone! Now grab the gif called ${OUTPUT_GIF_NAME} in the folder called ${OUTPUT_DIR}`);
  });
}

async function resizeBackground(backgroundPath) {
  const background = backgroundPath || BACKGROUND_NAME;
  const { stdout } = await sh(`identify -ping -format '%w %h' ${background}`);
  const size = stdout.split(' ');
  const width = size[0];
  const height = size[1];

  await sh(`convert ${background} -resize ${SIZE}x${SIZE} ${resizedBackgroundName}`);
}

let selectedBackground = null;
let selectedBackgroundColor = null;
let selectedText = null;

const standard_input = process.stdin;
standard_input.setEncoding('utf-8');

// Prompt user to input data in console.
// sh('ls -1 backgrounds').then(({ stdout }) => {
sh('find backgrounds -type f -not -path "*.DS_Store"').then(({ stdout }) => {
  console.log('\nStart by selecting an image to use for the letters:\n');

  const backgroundNames = stdout.slice(0, -1).split('\n');

  console.log(numberedList(backgroundNames.map(name => name.replace('backgrounds/', ''))));
  console.log('\n');

  standard_input.on('data', function(data) {
    if (data === 'cancel\n') {
      process.exit();
    } else if (selectedBackground === null && parseInt(data, 10) < backgroundNames.length && parseInt(data, 10) >= 0) {
      selectedBackground = backgroundNames[parseInt(data, 10)];

      console.log('\n------------------\n');
      console.log('Now select a background color:\n');
      console.log(numberedList(COLORS));
      console.log('\n');
    } else if (selectedBackgroundColor === null && parseInt(data, 10) < COLORS.length && parseInt(data, 10) >= 0) {
      selectedBackgroundColor = COLORS[parseInt(data, 10)];

      console.log('\n------------------\n');
      console.log('What would you like the GIF to say?\n');
      console.log('\n');
    } else if (selectedText === null && selectedBackground !== null && selectedBackgroundColor !== null && data) {
      selectedText = data;

      console.log('\n------------------\n');
      console.log('OK. Hold on!');

      resizeBackground(selectedBackground)
        .then(() => createGIF(selectedBackground, selectedBackgroundColor, selectedText))
        .then(() => process.exit());
    } else {
      console.log("\nI didn't quite get that. Type 'cancel' or 'exit' if you want to quit\n");
    }
  });
});

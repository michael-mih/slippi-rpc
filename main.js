/**
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!
 * CHANGE REPLAY DIRECTORY HERE
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
const replayDirectory = "/Documents/Slippi";
/**
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * CHANGE REPLAY DIRECTORY HERE
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */

const client = require('discord-rich-presence')('1125092736404570123');
const { SlippiGame } = require("@slippi/slippi-js");
const chokidar = require("chokidar");
const _ = require("lodash");
const os = require("os");


const listenPath = os.homedir() + replayDirectory;
let mode, stageId, stageKey, stageName, inGame, startTime, endTime, gameEnd;

console.log(`Listening at: ${listenPath}`);

const watcher = chokidar.watch(listenPath, {
  ignored: "!*.slp", // TODO: This doesn't work. Use regex?
  depth: 0,
  persistent: true,
  usePolling: true,
  ignoreInitial: true,
});

const gameByPath = {};
setInterval(() => {
    if(gameEnd){ //!inGame
        client.updatePresence({
            state: "Not in game",
            largeImageKey: "notingame",
            largeImageText: "Not in game",
            instance: false,
        });
        return;     
    }
    switch(stageId){
        case 3:
            stageKey = "pokemonstadium";
            stageName = "Pokemon Stadium"
            break;
        case 28:
            stageKey = "dreamland";
            stageName = "Dreamland"
            break;    
        case 8:
            stageKey = "yoshisstory";
            stageName = "Yoshi's Story"
            break;
        case 2:
            stageKey = "fountainofdreams";
            stageName = "Fountain of Dreams"
            break;
        case 31:
            stageKey = "battlefield";
            stageName = "Battlefield";
            break;
        case 32:
            stageKey = "finaldestination";
            stageName = "Final Destination"
            break;                
        default:
            stageKey = "pokefloats";
            stageName = "unknown stage";
            break;
    }
  
        client.updatePresence({
            state: "Playing on " + stageName,
            details: mode,
            largeImageKey: stageKey,
            largeImageText: stageName,
            startTimestamp: startTime,
            //endTimestamp: endTime, TODO
            instance: true,
            }); 
    
   
    
}, 15e3);
watcher.on("change", (path) => {

  let gameState, settings, stats, frames, latestFrame; //gameEnd;
  try {
    let game = _.get(gameByPath, [path, "game"]);
    if (!game) {
      console.log(`New file at: ${path}`);
      // Make sure to enable `processOnTheFly` to get updated stats as the game progresses
      game = new SlippiGame(path, { processOnTheFly: true });
      gameByPath[path] = {
        game: game,
        state: {
          settings: null,
          detectedPunishes: {},
        },
      };
    }

    gameState = _.get(gameByPath, [path, "state"]);

    settings = game.getSettings();

    gameEnd = game.getGameEnd();
  } catch (err) {
    console.log(err);
    return;
  }

  if (!gameState.settings && settings) {
    startTime = Date.now();
    endTime = startTime + 480;
    console.log(settings);
    mode = settings.matchInfo.matchId;
    mode = mode.slice(5, mode.search("-"));
    mode = mode.charAt(0).toUpperCase() + mode.slice(1);
    inGame = true;
    console.log(`[Game Start] New game has started`);
    stageId = settings.stageId;
    gameState.settings = settings;
    
  }



  if (gameEnd) {
    inGame = false;
  }

});
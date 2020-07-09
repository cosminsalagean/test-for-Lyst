#!/usr/bin/env node
const fs = require('fs');

//format config file into JSON 
const getConfig = () => {
  try {
    return fs
      .readFileSync(0, 'utf8')
      .toString()
      .trim()
      .split(/\r?\n/)
      .map(line => {
        const timeDetails = line.split(" ");
        return {
          minute: timeDetails[0],
          hour: timeDetails[1],
          file: timeDetails[2],
        }
      });
  } catch (e) {
    console.log('Error:', e.stack);
  }
  return null;
}

// transform string into hour and minutes
const parseTime = time => {
  const [ hourStr, minuteStr ] = time.split(":");
  const [ hour, minute ] = [ parseInt(hourStr, 10), parseInt(minuteStr, 10) ];
  if (Number.isNaN(hour) == true || Number.isNaN(minute) == true || hour > 24 || minute > 59) {
    //time is incorrect, accepted format is HH:MM
    console.log('please make sure the time is corect');
    return null;
  }
  return { hour, minute };
};

// calculate time according to config file
const configureTime = (time, config) => {
  let date, hour, minute;

  // minutes configuration 
  minute = config.minute == '*' ? ((config.hour != time.hour && config.hour != '*') ? 00 : time.minute) : config.minute;

  // hour configuration
  if (config.hour == '*') {
    hour = config.minute == '*' ? time.hour : (config.minute > time.minute ? time.hour : (time.hour == 23 ? 00 : time.hour + 1));
    // determine date
    date = (hour == 00 && time.hour != 00) ? 'tomorrow' : 'today';
  } else {
    // verify if hour is less than current hour
    hour = config.hour;
    // determine date
    date = config.hour < time.hour ? 'tomorrow' : 'today';
  }

  // check and enforce all 0 values within hour and minute to be 00
  hour = hour == 0 ? '00' : hour;
  minute = minute == 0 ? '00' : minute;

  // log the string with everithing config 
  console.log(hour + ':' + minute + ' ' + date + ' ' + '- ' + config.file);
  return { minute, hour, date };

};

const run = () => {
  // take in the time arg from command line
  const args = process.argv.slice(2);

  let shouldRun = true;
  let parsedTime = null;

  // verify command line inputs
  if (!args || args.length < 1) {
    console.log('please enter time input');
    shouldRun = false;
  } else {
    parsedTime = parseTime(args[0]);

    // verify parsedTime format
    if (!parsedTime) {
      console.log('time input format is wrong, please use the following format: HH:MM');
      shouldRun = false;
    }
  }

  if (shouldRun) {
    const data = getConfig();
    if (parsedTime && data) {
      data.map(config => {
        configureTime(parsedTime, config);
      })
    };
  }
}

run();
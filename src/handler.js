const { write } = require('fs');
const fs = require('fs/promises');

let data = [];
MAX_BUFFER = 100;
OUT_DIR = './src/data.csv'

const undefinedChecker = (...data) => {
  let flag = 1;
  for (let i = 0; i < data.length; i++) {
    flag = flag && (data[i] === null || data[i] === undefined)
  }

  return flag;
}

const writeData = async (data) => {
  console.log(new Date().toLocaleString());
  console.log(`Writting`);
  let last_r = 0, last_fd = 0, last_fr = 0, last_be = 0, last_tl = 0, last_tp = 0, last_tu = 0, last_tb = 0, last_rtt = 0, last_rto = 0
  let curr_data = await fs.readFile(OUT_DIR);
  

  curr_data = curr_data.toString();

  const temp = curr_data.split('\n');
  console.log(temp.length);

  let last_data = temp[temp.length - 2];
  console.log(last_data);

  if (last_data)
  {
    last_data = last_data.split(',');
    [last_r = 0, last_fd = 0, last_fr = 0, last_be = 0, last_tl = 0, last_tp = 0, last_tu = 0, last_tb = 0, last_rtt = 0, last_rto = 0] = last_data;
  }
  let new_data;
  // ambil data dari prev data

  for (let i = 0; i < data.length; i++) {
    console.log(data[i]);
    const {
      time,
      a, 
      r, 
      fd, 
      fr, 
      be, 
      tl, 
      tp, 
      tu, 
      tb, 
      sRtt, 
      rto, 
    } = data[i];
    if (a === 'P') {
      if (undefinedChecker(r, fd, fr, be, tl, tp, tu, tb)) return;
       // don't process any empty data
      new_data = `${time},${r},${fd},${fr},${be},${tl},${tp},${tu},${tb},${last_rtt},${last_rto}\n`;
      [last_r, last_fd, last_fr, last_be, last_tl, last_tp, last_tu] = [r, fd, fr, be, tl, tp, tu, tb];

    } else if (a === 'F') {
      if (undefinedChecker(sRtt, rto)) return;
  
      new_data = `${time},${last_r},${last_fd},${last_fr},${last_be},${last_tl},${last_tp},${last_tu},${last_tb},${sRtt},${rto}\n`;
      [last_rtt, last_rto] = [sRtt, rto];
    }

    curr_data += new_data;
  }
  
  data = []; // flush data
  await fs.writeFile(OUT_DIR, curr_data + "\n");
  console.log(`success`);
}

const updateData = async (newData) => {
  writeData(newData);
}

const dataHandler = (request, h) => {
  const newData = request.payload;
  console.log(JSON.stringify(newData));
  datetime = new Date().toString().split(" ");
	time = datetime[4];
  newData["time"] = time;
  console.log(newData);
  data.push(newData);
  if (data.length > MAX_BUFFER) {
    const newData = data;
    data = [];
    setTimeout(updateData, 500, newData);
  }

  return h.response({
    status: "success", 
  }).code(201);
}

module.exports = {dataHandler, data, writeData};
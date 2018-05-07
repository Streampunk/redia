/* Copyright 2018 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const Redis = require('ioredis');
let redis = new Redis(isNaN(+process.argv[2]) ? 6379 : +process.argv[2], process.argv[3]);

async function writeBuf(size, n) {
  let buf = Buffer.alloc(size);
  let keys = [];
  let sum = 0.0;
  for ( let x = 0 ; x < n ; x++ ) {
    let key = 'foo' + (Math.random() * 1000000000|0);
    keys.push(key);
    let start = process.hrtime();
    let result = await redis.set(key, buf);
    let end = process.hrtime(start);
    sum += end[0] + end[1] / 1000000000;
  }

  return [keys, sum / n];
}

async function readBufs(keys) {
  let sum = 0.0;
  for ( let key of keys ) {
    let start = process.hrtime();
    let result = await redis.getBuffer(key);
    let end = process.hrtime(start);
    sum += end[0] + end[1] / 1000000000;
  }
  return sum / keys.length;
}

async function runTest(size, number, description) {
  await redis.flushall();
  let [keys, writeTime] = await writeBuf(size, number);
  let readTime = await readBufs(keys);
  console.log(`Roundtripped ${description} simulated ${number} frames write time ${writeTime} read time ${readTime}.`);
}

async function runParallel(size, number, description) {
  await redis.flushall();
  let [keys, writeTime] = await writeBuf(size, number);
  let start = process.hrtime();
  let results = await Promise.all(keys.map(k => redis.getBuffer(k)));
  let end = process.hrtime(start);
  let readTime = (end[0] + end[1] / 1000000000) / number;
  console.log(`Roundtripped ${description} simulated ${number} frames write time ${writeTime} read time ${readTime}.`);
}

async function tests(number) {
  await runTest(5296000, number, "1080i50 V210");
  await runParallel(5296000, number, "1080i50 V210 parallel");
  await runTest(8294400, number, "1080i50 4:2:2 16-bit");
  await runTest(5296000 * 4, number, "4kp50 V210");
  await runParallel(5296000 * 4, number, "4kp50 V210 parallel");
  await runTest(2457600, number, "720p60 V210");
}

tests(10).then(() => redis.disconnect());
